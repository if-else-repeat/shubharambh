/**
 * Default deterministic fallback event plans tailored to celebration scale and cultural rituals.
 */

export interface GeneratedVendorPlanItem {
  id: string;
  name: string;
  category: string;
  cost: number;
  status: 'Pending' | 'Booked' | 'Paid';
}

export interface GeneratedTaskPlanItem {
  id: string;
  title: string;
  deadlineGroup: string;
  dueDate: string;
  completed: boolean;
}

export interface GeneratedPlanResult {
  vendors: GeneratedVendorPlanItem[];
  tasks: GeneratedTaskPlanItem[];
}

/**
 * Generates an initial celebration plan and ledger when offline or when AI is unavailable.
 */
export function generateDefaultEventPlan(
  name: string,
  budget: number,
  guests: number
): GeneratedPlanResult {
  const isMicro = budget < 35000 || guests <= 25;
  const isRitual =
    name.toLowerCase().includes('puja') ||
    name.toLowerCase().includes('griha') ||
    name.toLowerCase().includes('haldi') ||
    name.toLowerCase().includes('mehendi') ||
    name.toLowerCase().includes('godh');

  if (isMicro) {
    return {
      vendors: [
        {
          id: `v-${Date.now()}-1`,
          name: 'Custom Photo Cake & Desserts',
          category: 'Catering',
          cost: Math.round(budget * 0.28),
          status: 'Booked',
        },
        {
          id: `v-${Date.now()}-2`,
          name: 'Food Platters & Beverage Crate',
          category: 'Catering',
          cost: Math.round(budget * 0.42),
          status: 'Pending',
        },
        {
          id: `v-${Date.now()}-3`,
          name: 'Fairy Lights & Polaroid Corner',
          category: 'Decor',
          cost: Math.round(budget * 0.12),
          status: 'Pending',
        },
      ],
      tasks: [
        {
          id: `t-${Date.now()}-1`,
          title: 'Order custom cake with custom design',
          deadlineGroup: '1 Month Out',
          dueDate: 'TBD',
          completed: true,
        },
        {
          id: `t-${Date.now()}-2`,
          title: 'Curate party playlist & test sound system',
          deadlineGroup: 'Week Of',
          dueDate: 'TBD',
          completed: false,
        },
        {
          id: `t-${Date.now()}-3`,
          title: 'Confirm RSVP head count & order bulk platters',
          deadlineGroup: 'Day Of',
          dueDate: 'TBD',
          completed: false,
        },
      ],
    };
  }

  if (isRitual) {
    return {
      vendors: [
        {
          id: `v-${Date.now()}-1`,
          name: 'Pandit Ji Dakshina & Puja Samagri',
          category: 'Ritual',
          cost: Math.round(budget * 0.18),
          status: 'Booked',
        },
        {
          id: `v-${Date.now()}-2`,
          name: 'Traditional Halwai & Prasad Feast',
          category: 'Catering',
          cost: Math.round(budget * 0.42),
          status: 'Booked',
        },
        {
          id: `v-${Date.now()}-3`,
          name: 'Fresh Marigold Torans & Brass Urulis',
          category: 'Decor',
          cost: Math.round(budget * 0.2),
          status: 'Pending',
        },
        {
          id: `v-${Date.now()}-4`,
          name: 'Return Gifts (Brass Diyas & Dry Fruits)',
          category: 'Stationery',
          cost: Math.round(budget * 0.15),
          status: 'Pending',
        },
      ],
      tasks: [
        {
          id: `t-${Date.now()}-1`,
          title: 'Lock auspicious shubh muhurat & book Pandit Ji',
          deadlineGroup: '1 Month Out',
          dueDate: 'TBD',
          completed: true,
        },
        {
          id: `t-${Date.now()}-2`,
          title: 'Procure dry puja samagri & fresh havan items',
          deadlineGroup: 'Week Of',
          dueDate: 'TBD',
          completed: false,
        },
        {
          id: `t-${Date.now()}-3`,
          title: 'Organize return gifts and packaging for departing guests',
          deadlineGroup: 'Day Of',
          dueDate: 'TBD',
          completed: false,
        },
      ],
    };
  }

  return {
    vendors: [
      {
        id: `v-${Date.now()}-1`,
        name: 'Primary Venue Space',
        category: 'Venue',
        cost: Math.round(budget * 0.35),
        status: 'Booked',
      },
      {
        id: `v-${Date.now()}-2`,
        name: 'Catering & Beverages',
        category: 'Catering',
        cost: Math.round(budget * 0.35),
        status: 'Booked',
      },
      {
        id: `v-${Date.now()}-3`,
        name: 'Ambient Decor & Floral Staging',
        category: 'Decor',
        cost: Math.round(budget * 0.12),
        status: 'Pending',
      },
      {
        id: `v-${Date.now()}-4`,
        name: 'Cinematic Photography & Sound',
        category: 'Photography',
        cost: Math.round(budget * 0.1),
        status: 'Pending',
      },
    ],
    tasks: [
      {
        id: `t-${Date.now()}-1`,
        title: 'Finalize venue lease agreement and deposit',
        deadlineGroup: '3 Months Out',
        dueDate: 'TBD',
        completed: true,
      },
      {
        id: `t-${Date.now()}-2`,
        title: 'Lock menu tasting & verify plate count audit clauses',
        deadlineGroup: '1 Month Out',
        dueDate: 'TBD',
        completed: false,
      },
      {
        id: `t-${Date.now()}-3`,
        title: 'Disburse RTGS advance payments to caterer & decorators',
        deadlineGroup: 'Week Of',
        dueDate: 'TBD',
        completed: false,
      },
    ],
  };
}
