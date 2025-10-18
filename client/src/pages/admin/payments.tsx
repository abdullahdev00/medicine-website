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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, X, Copy, CheckCheck } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PaymentRequest, UserPaymentAccount, PaymentAccount } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";

export default function AdminPayments() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);

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
      setSelectedPayment(null);
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
                  <TableHead>Account Number</TableHead>
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
                      <TableCell colSpan={9}>
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : payments && payments.length > 0 ? (
                  payments.map((payment) => {
                    const userAccount = getUserPaymentAccount(payment.userPaymentAccountId);
                    const paymentAccount = getPaymentAccount(payment.paymentAccountId);
                    
                    return (
                    <TableRow 
                      key={payment.id} 
                      data-testid={`row-payment-${payment.id}`}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <TableCell className="font-medium" data-testid="text-payment-id">
                        #{payment.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="capitalize">{payment.type}</TableCell>
                      <TableCell data-testid="text-payment-amount">Rs. {payment.amount}</TableCell>
                      <TableCell>{payment.paymentMethod || "N/A"}</TableCell>
                      <TableCell>
                        {payment.type === "withdrawal" && userAccount ? (
                          <div 
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(userAccount.raastId, payment.id);
                            }}
                            data-testid="button-copy-account-number"
                          >
                            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {userAccount.raastId}
                            </div>
                            {copiedId === payment.id ? (
                              <CheckCheck className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {payment.type === "deposit" && payment.receiptUrl ? (
                          <div className="w-16 h-16 rounded border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <img 
                              src={payment.receiptUrl} 
                              alt="Receipt"
                              className="w-full h-full object-cover"
                              data-testid="img-receipt-thumbnail"
                            />
                          </div>
                        ) : payment.type === "withdrawal" && userAccount ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-700 dark:text-gray-300">{userAccount.accountName}</div>
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
                          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              className="bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-200 dark:hover:bg-green-300 dark:text-green-800 h-8 w-8 p-0"
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
                              className="bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-200 dark:hover:bg-red-300 dark:text-red-800 h-8 w-8 p-0"
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
                    <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                      No payment requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {selectedPayment && (
        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent className="max-w-2xl" data-testid="dialog-payment-details">
            <DialogHeader>
              <DialogTitle>Payment Request Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {selectedPayment.type === "deposit" && selectedPayment.receiptUrl && (
                <div className="w-full">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Receipt Image
                  </label>
                  <div className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800">
                    <img 
                      src={selectedPayment.receiptUrl} 
                      alt="Payment Receipt"
                      className="w-full h-auto max-h-96 object-contain"
                      data-testid="img-receipt-full"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Request ID</label>
                  <p className="text-base font-medium text-gray-900 dark:text-white" data-testid="text-dialog-request-id">
                    #{selectedPayment.id.slice(0, 8)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                  <p className="text-base font-medium text-gray-900 dark:text-white capitalize">
                    {selectedPayment.type}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</label>
                  <p className="text-base font-bold text-cyan-600 dark:text-cyan-400" data-testid="text-dialog-amount">
                    Rs. {selectedPayment.amount}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</label>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {selectedPayment.paymentMethod || "N/A"}
                  </p>
                </div>

                {selectedPayment.type === "withdrawal" && getUserPaymentAccount(selectedPayment.userPaymentAccountId) && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Name</label>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {getUserPaymentAccount(selectedPayment.userPaymentAccountId)?.accountName}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Raast ID / Account Number</label>
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded w-fit"
                        onClick={() => {
                          const account = getUserPaymentAccount(selectedPayment.userPaymentAccountId);
                          if (account) {
                            copyToClipboard(account.raastId, selectedPayment.id);
                          }
                        }}
                        data-testid="button-copy-dialog-account"
                      >
                        <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                          {getUserPaymentAccount(selectedPayment.userPaymentAccountId)?.raastId}
                        </p>
                        {copiedId === selectedPayment.id ? (
                          <CheckCheck className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedPayment.status)}>
                      {selectedPayment.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</label>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {format(new Date(selectedPayment.createdAt), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>

                {selectedPayment.adminNotes && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Admin Notes</label>
                    <p className="text-base text-gray-900 dark:text-white mt-1">
                      {selectedPayment.adminNotes}
                    </p>
                  </div>
                )}

                {selectedPayment.rejectionReason && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejection Reason</label>
                    <p className="text-base text-red-600 dark:text-red-400 mt-1">
                      {selectedPayment.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              {selectedPayment.status === "pending" && (
                <div className="flex gap-3 w-full justify-end">
                  <Button
                    className="bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-200 dark:hover:bg-green-300 dark:text-green-800"
                    onClick={() => 
                      updatePaymentMutation.mutate({ 
                        paymentId: selectedPayment.id, 
                        status: "approved" 
                      })
                    }
                    disabled={updatePaymentMutation.isPending}
                    data-testid="button-dialog-approve"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    className="bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-200 dark:hover:bg-red-300 dark:text-red-800"
                    onClick={() => 
                      updatePaymentMutation.mutate({ 
                        paymentId: selectedPayment.id, 
                        status: "rejected",
                        rejectionReason: "Review required"
                      })
                    }
                    disabled={updatePaymentMutation.isPending}
                    data-testid="button-dialog-reject"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
    </ProtectedAdminRoute>
  );
}
