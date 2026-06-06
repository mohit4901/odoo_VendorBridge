import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialRfqs, initialQuotes } from '../../mock/rfqsData';
import { useNotifications } from '../NotificationContext/NotificationContext';
import { useAuth } from '../AuthContext';

const RFQContext = createContext(null);

export const RFQProvider = ({ children }) => {
  const [rfqs, setRfqs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification, addAuditLog } = useNotifications();
  const { user } = useAuth();

  useEffect(() => {
    // Initialize RFQs
    const savedRfqs = localStorage.getItem('vb_rfqs');
    if (savedRfqs) {
      setRfqs(JSON.parse(savedRfqs));
    } else {
      localStorage.setItem('vb_rfqs', JSON.stringify(initialRfqs));
      setRfqs(initialRfqs);
    }

    // Initialize Quotes
    const savedQuotes = localStorage.getItem('vb_quotes');
    if (savedQuotes) {
      setQuotes(JSON.parse(savedQuotes));
    } else {
      localStorage.setItem('vb_quotes', JSON.stringify(initialQuotes));
      setQuotes(initialQuotes);
    }
    
    setLoading(false);
  }, []);

  // Save RFQs to localStorage
  const saveRfqs = (updatedRfqs) => {
    setRfqs(updatedRfqs);
    localStorage.setItem('vb_rfqs', JSON.stringify(updatedRfqs));
  };

  // Save Quotes to localStorage
  const saveQuotes = (updatedQuotes) => {
    setQuotes(updatedQuotes);
    localStorage.setItem('vb_quotes', JSON.stringify(updatedQuotes));
  };

  // Publish RFQ
  const publishRfq = (rfqData) => {
    const newRfq = {
      id: Date.now(),
      status: 'Sent',
      ...rfqData
    };
    const updated = [newRfq, ...rfqs];
    saveRfqs(updated);

    // Dynamic Notifications & Logs
    addNotification(`RFQ "${rfqData.title}" published successfully`, 'success');
    addAuditLog(`RFQ Published`, `RFQ for "${rfqData.title}" dispatched to suppliers.`, 'rfq', user?.name || 'Console Administrator');

    return newRfq;
  };

  // Submit quote
  const submitQuote = (quoteData) => {
    const newQuote = {
      id: Date.now(),
      ...quoteData
    };
    const updated = [newQuote, ...quotes];
    saveQuotes(updated);

    // Dynamic Notifications & Logs
    addNotification(`New quotation submitted by ${quoteData.vendorName}`, 'info');
    addAuditLog(`Quotation Submitted`, `Vendor ${quoteData.vendorName} submitted a bid of $${quoteData.totalCost?.toLocaleString() || quoteData.totalBid?.toLocaleString() || '0'} for RFQ.`, 'rfq', 'System Bot');

    return newQuote;
  };

  // Award contract
  const awardContract = (rfqId, quoteId) => {
    let rfqTitle = 'RFQ';
    let vendorName = 'Vendor';
    let amount = 0;

    const updatedRfqs = rfqs.map(rfq => {
      if (rfq.id === rfqId) {
        rfqTitle = rfq.title;
        return {
          ...rfq,
          status: 'Closed & Awarded',
          awardedQuoteId: quoteId
        };
      }
      return rfq;
    });
    saveRfqs(updatedRfqs);

    const quote = quotes.find(q => q.id === quoteId);
    if (quote) {
      vendorName = quote.vendorName;
      amount = quote.totalCost || quote.totalBid || 0;
    }

    // Dynamic Notifications & Logs
    addNotification(`Contract awarded to ${vendorName} for RFQ "${rfqTitle}"`, 'success');
    addAuditLog(`Contract Awarded`, `RFQ "${rfqTitle}" contract awarded to ${vendorName} ($${amount.toLocaleString()}).`, 'rfq', user?.name || 'Console Administrator');
  };

  return (
    <RFQContext.Provider value={{ rfqs, quotes, publishRfq, submitQuote, awardContract, loading }}>
      {!loading && children}
    </RFQContext.Provider>
  );
};

export const useRFQs = () => {
  const context = useContext(RFQContext);
  if (!context) {
    throw new Error('useRFQs must be used within an RFQProvider');
  }
  return context;
};
