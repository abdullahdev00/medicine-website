import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Copy, CheckCheck, ExternalLink } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PaymentRequest, UserPaymentAccount, PaymentAccount } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";

export default function AdminPayments() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: payments, isLoading } = useQuery<PaymentRequest[]>({
    queryKey: ["/api/admin/payment-requests"],
  });

  const { data: userPaymentAccounts } = useQuery<UserPaymentAccount[]>({
    queryKey: ["/api/admin/user-payment-accounts"],
  });

  const { data: paymentAccounts } = useQuery<PaymentAccount[]>({
    queryKey: ["/api/payment-accounts"],
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ paymentId, status, rejectionReason }: { 
      paymentId: string; 
      status: string;
      rejectionReason?: string;
    }) => {
      const res = await apiRequest("PATCH", `/api/admin/payment-requests/${paymentId}/status`, { 
        status, 
        rejectionReason 
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-requests"] });
      toast({
        title: "Success",
        description: "Payment request updated successfully",
      });
    },
  });

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast({
        title: "Copied!",
        description: "Account details copied to clipboard",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getUserPaymentAccount = (accountId: string | null) => {
    if (!accountId || !userPaymentAccounts) return null;
    return userPaymentAccounts.find(acc => acc.id === accountId);
  };

  const getPaymentAccount = (accountId: string | null) => {
    if (!accountId || !paymentAccounts) return null;
    return paymentAccounts.find(acc => acc.id === accountId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "approved":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <ProtectedAdminRoute>
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-payments-title">
            Payment Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and process payment requests
          </p>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Receipt/Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8}>
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : payments && payments.length > 0 ? (
                  payments.map((payment) => {
                    const userAccount = getUserPaymentAccount(payment.userPaymentAccountId);
                    const paymentAccount = getPaymentAccount(payment.paymentAccountId);
                    
                    return (
                    <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                      <TableCell className="font-medium" data-testid="text-payment-id">
                        #{payment.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="capitalize">{payment.type}</TableCell>
                      <TableCell data-testid="text-payment-amount">Rs. {payment.amount}</TableCell>
                      <TableCell>{payment.paymentMethod || "N/A"}</TableCell>
                      <TableCell>
                        {payment.type === "deposit" && payment.receiptUrl ? (
                          <a 
                            href={payment.receiptUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            data-testid="link-receipt"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Receipt
                          </a>
                        ) : payment.type === "withdraw" && userAccount ? (
                          <div className="flex items-center gap-2">
                            <div className="text-sm">
                              <div className="font-medium">{userAccount.accountName}</div>
                              <div className="text-gray-500 dark:text-gray-400">{userAccount.raastId}</div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(userAccount.raastId, payment.id)}
                              className="h-8 w-8 p-0"
                              data-testid="button-copy-account"
                            >
                              {copiedId === payment.id ? (
                                <CheckCheck className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(payment.createdAt), "MMM dd, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        {payment.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                              onClick={() => 
                                updatePaymentMutation.mutate({ 
                                  paymentId: payment.id, 
                                  status: "approved" 
                                })
                              }
                              disabled={updatePaymentMutation.isPending}
                              data-testid="button-approve-payment"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 w-8 p-0"
                              onClick={() => 
                                updatePaymentMutation.mutate({ 
                                  paymentId: payment.id, 
                                  status: "rejected",
                                  rejectionReason: "Review required"
                                })
                              }
                              disabled={updatePaymentMutation.isPending}
                              data-testid="button-reject-payment"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      No payment requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AdminLayout>
    </ProtectedAdminRoute>
  );
}
