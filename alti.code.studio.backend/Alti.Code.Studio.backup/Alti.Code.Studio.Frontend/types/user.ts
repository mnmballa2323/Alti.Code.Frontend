export type PlanType = {
  price?: number;
  plan_name?: string;
  duration?: string;
};

export type UserType = {
  _id: string;
  email?: string;
  role?: string;
  profile?: string;
  isProfileComplete?: boolean;
  plan?: string;
  paymentStatus?: 'paid' | 'canceled' | 'expired' | 'pending';
  createdAt?: string;
  updatedAt?: string;
  __v: number;
  deleteAccountExpires?: string;
  deleteAccountOTP?: string;
  resetPasswordExpires?: string;
  resetPasswordOTP?: string;
  username?: string;
  location?: string;
  description?: string;
  isSubscribed?: boolean;
  transactionId?: string;
  invoiceUrl?: string;
  payment_status?: string;
  expires_at?: string;
  subscriptions?: string[];
  plans?: PlanType;
  preferences?: {
    memoryEnabled: boolean;
    theme: string;
    notifications: boolean;
  };
};

export type UseStatusType = {
  isLoading: boolean;
  data: UserType;
};

export type Subscription = {
  price: number;
  plan_name: string;
  duration: 'day' | 'month' | 'year' | string;
  expiresAt: string;
  status: 'paid' | 'expired' | string;
};

export type User = {
  _id: string;
  email: string;
  role: string;
  isSubscribed: boolean;
  subscription: Subscription;
};