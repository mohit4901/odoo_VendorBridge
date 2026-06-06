import React, { createContext, useContext, useState, useEffect } from 'react';
import rfqService from '../../services/rfqService';
import quotationService from '../../services/quotationService';
import { useNotifications } from '../NotificationContext/NotificationContext';
import { useAuth } from '../AuthContext';

const RFQContext = createContext(null);

export const RFQProvider = ({ children }) => {
  const [rfqs, setRfqs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification, addAuditLog } = useNotifications();
  const { user } = useAuth();

  const fetchRfqsAndQuotes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const rfqsRes = await rfqService.list();
      if (rfqsRes.success && rfqsRes.data) {
        setRfqs(rfqsRes.data);
      }
      const quotesRes = await quotationService.list();
      if (quotesRes.success && quotesRes.data) {
        setQuotes(quotesRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch RFQs or Quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqsAndQuotes();
  }, [user]);

  // Publish RFQ
  const publishRfq = async (rfqData) => {
    try {
      const createRes = await rfqService.create({
        ...rfqData,
        status: 'Sent'
      });
      if (createRes.success && createRes.data) {
        const publishRes = await rfqService.publish(createRes.data._id || createRes.data.id);
        
        await fetchRfqsAndQuotes();

        addNotification(`RFQ "${rfqData.title}" published successfully`, 'success');
        addAuditLog(`RFQ Published`, `RFQ for "${rfqData.title}" dispatched to suppliers.`, 'rfq', user?.name || 'Console Administrator');

        return createRes.data;
      }
    } catch (err) {
      console.error('Failed to publish RFQ:', err);
      addNotification(err.message || 'Failed to publish RFQ', 'error');
    }
  };

  // Submit quote
  const submitQuote = async (quoteData) => {
    try {
      const res = await quotationService.submit(quoteData);
      if (res.success && res.data) {
        await fetchRfqsAndQuotes();

        addNotification(`New quotation submitted by ${quoteData.vendorName}`, 'info');
        addAuditLog(`Quotation Submitted`, `Vendor ${quoteData.vendorName} submitted a bid of $${quoteData.totalBid?.toLocaleString() || '0'} for RFQ.`, 'rfq', 'System Bot');

        return res.data;
      }
    } catch (err) {
      console.error('Failed to submit quote:', err);
      addNotification(err.message || 'Failed to submit quote', 'error');
    }
  };

  // Award contract
  const awardContract = async (rfqId, quoteId) => {
    try {
      const res = await quotationService.award(quoteId);
      if (res.success) {
        await fetchRfqsAndQuotes();

        const quote = quotes.find(q => (q._id || q.id) === quoteId);
        const rfq = rfqs.find(r => (r._id || r.id) === rfqId);
        
        const vendorName = quote?.vendorName || 'Vendor';
        const rfqTitle = rfq?.title || 'RFQ';
        const amount = quote?.totalBid || 0;

        addNotification(`Contract awarded to ${vendorName} for RFQ "${rfqTitle}"`, 'success');
        addAuditLog(`Contract Awarded`, `RFQ "${rfqTitle}" contract awarded to ${vendorName} ($${amount.toLocaleString()}).`, 'rfq', user?.name || 'Console Administrator');
      }
    } catch (err) {
      console.error('Failed to award contract:', err);
      addNotification(err.message || 'Failed to award contract', 'error');
    }
  };

  return (
    <RFQContext.Provider value={{ rfqs, quotes, publishRfq, submitQuote, awardContract, loading, refresh: fetchRfqsAndQuotes }}>
      {children}
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
