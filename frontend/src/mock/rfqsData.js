export const initialRfqs = [
  {
    id: 1,
    title: 'Office Furniture Procurement',
    category: 'Office Furniture',
    deliveryDate: '2026-06-25',
    description: 'Procurement of ergonomic mesh office chairs and dual-motor standing desks for the Delhi office expansion.',
    status: 'Sent',
    vendorIds: [1, 2, 5], // Apex Supplies, Zenith Energy, Cyber Solutions
    items: [
      { id: 101, name: 'Ergonomic Office Chair', qty: 50, uom: 'Units' },
      { id: 102, name: 'Standing Desk (Dual Motor)', qty: 25, uom: 'Units' }
    ]
  },
  {
    id: 2,
    title: 'Raw Lithium Carbonate Supply',
    category: 'Raw Materials',
    deliveryDate: '2026-07-15',
    description: 'Battery-grade lithium carbonate (Li2CO3, 99.5% purity) for research and cell fabrication.',
    status: 'Under Review',
    vendorIds: [2, 4], // Zenith Energy, Apex Metals
    items: [
      { id: 201, name: 'Lithium Carbonate Powder', qty: 10, uom: 'Tons' }
    ]
  }
];

export const initialQuotes = [
  {
    id: 1001,
    rfqId: 1,
    vendorId: 1,
    vendorName: 'Apex Supplies Ltd.',
    slaScore: 95,
    deliveryTime: '10 days',
    terms: '30 days net payment. Free shipping.',
    validityDate: '2026-07-05',
    items: {
      101: 150, // Ergo Chair
      102: 350  // Standing Desk
    },
    totalBid: 16250
  },
  {
    id: 1002,
    rfqId: 1,
    vendorId: 5,
    vendorName: 'Cyber Solutions Group',
    slaScore: 96,
    deliveryTime: '7 days',
    terms: '15 days net. Shipping $500 extra.',
    validityDate: '2026-07-10',
    items: {
      101: 165,
      102: 320
    },
    totalBid: 16250 // (165*50 + 320*25) = 8250 + 8000 = 16250
  },
  {
    id: 2001,
    rfqId: 2,
    vendorId: 4,
    vendorName: 'Apex Metals Inc.',
    slaScore: 78,
    deliveryTime: '14 days',
    terms: '50% advance, 50% on delivery.',
    validityDate: '2026-06-30',
    items: {
      201: 12500
    },
    totalBid: 125000
  },
  {
    id: 2002,
    rfqId: 2,
    vendorId: 2,
    vendorName: 'Zenith Energy Solutions',
    slaScore: 88,
    deliveryTime: '20 days',
    terms: 'Net 45. Standard warranty applies.',
    validityDate: '2026-07-01',
    items: {
      201: 11800
    },
    totalBid: 118000
  }
];
