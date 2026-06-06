import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialRfqs, initialQuotes } from '../../mock/rfqsData';

const RFQContext = createContext(null);

export const RFQProvider = ({ children }) => {
  const [rfqs, setRfqs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

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
    return newQuote;
  };

  // Award contract
  const awardContract = (rfqId, quoteId) => {
    const updatedRfqs = rfqs.map(rfq => {
      if (rfq.id === rfqId) {
        return {
          ...rfq,
          status: 'Closed & Awarded',
          awardedQuoteId: quoteId
        };
      }
      return rfq;
    });
    saveRfqs(updatedRfqs);
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
