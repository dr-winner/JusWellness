export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          category: "juice" | "coconut" | "mashke" | "shot";
          ingredients: string[];
          benefits: string[];
          image_url: string | null;
          badge: string | null;
          in_stock: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      product_sizes: {
        Row: {
          id: string;
          product_id: string;
          label: string;
          ml: number;
          price: number;
          sort_order: number;
        };
        Insert: Omit<Database["public"]["Tables"]["product_sizes"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["product_sizes"]["Insert"]>;
      };
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          address: string | null;
          area: string | null;
          notes: string | null;
          total_orders: number;
          total_spent: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["customers"]["Row"], "id" | "created_at" | "total_orders" | "total_spent">;
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          customer_name: string;
          customer_phone: string;
          delivery_address: string | null;
          channel: "online" | "whatsapp" | "walkin" | "wholesale";
          status: "pending" | "confirmed" | "preparing" | "delivered" | "cancelled";
          subtotal: number;
          delivery_fee: number;
          total: number;
          payment_method: "paystack" | "momo" | "cash" | "transfer" | null;
          payment_status: "unpaid" | "paid" | "refunded";
          payment_reference: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "order_number" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          size_label: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Insert: Omit<Database["public"]["Tables"]["order_items"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
      };
      inventory: {
        Row: {
          id: string;
          name: string;
          category: "fruit" | "vegetable" | "spice" | "packaging" | "other";
          unit: string;
          quantity: number;
          cost_per_unit: number;
          reorder_level: number;
          supplier: string | null;
          last_restocked: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["inventory"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["inventory"]["Insert"]>;
      };
      inventory_logs: {
        Row: {
          id: string;
          inventory_id: string;
          type: "restock" | "used" | "adjustment" | "waste";
          quantity: number;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["inventory_logs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["inventory_logs"]["Insert"]>;
      };
      production_batches: {
        Row: {
          id: string;
          batch_number: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          status: "in-progress" | "completed" | "discarded";
          notes: string | null;
          produced_at: string;
          expires_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["production_batches"]["Row"], "id" | "batch_number" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["production_batches"]["Insert"]>;
      };
      batch_ingredients: {
        Row: {
          id: string;
          batch_id: string;
          inventory_id: string | null;
          ingredient_name: string;
          amount: number;
          unit: string;
        };
        Insert: Omit<Database["public"]["Tables"]["batch_ingredients"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["batch_ingredients"]["Insert"]>;
      };
      inquiries: {
        Row: {
          id: string;
          name: string;
          phone: string;
          order_type: string | null;
          message: string | null;
          status: "new" | "contacted" | "resolved";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["inquiries"]["Row"], "id" | "created_at" | "status">;
        Update: Partial<Database["public"]["Tables"]["inquiries"]["Insert"]>;
      };
    };
  };
};
