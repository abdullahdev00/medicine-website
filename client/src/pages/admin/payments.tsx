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
import { Check, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PaymentRequest } from "@shared/schema";
import { format } from "date-fns";

export default function AdminPayments() {
  const { toast } = useToast();

  const { data: payments, isLoading } = useQuery<PaymentRequest[]>({
    queryKey: ["/api/admin/payment-requests"],
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ paymentId, status, rejectionReason }: { 
      paymentId: string; 
      status: string;
      rejectionReason?: string;
    }) => {
      return apiRequest(`/api/admin/payment-requests/${paymentId}`, {
        method: "PATCH",
        body: JSON.stringify({ status, rejectionReason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-requests"] });
      toast({
        title: "Success",
        description: "Payment request updated successfully",
      });
    },
  });

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
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : payments && payments.length > 0 ? (
                  payments.map((payment) => (
                    <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                      <TableCell className="font-medium" data-testid="text-payment-id">
                        #{payment.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="capitalize">{payment.type}</TableCell>
                      <TableCell data-testid="text-payment-amount">Rs. {payment.amount}</TableCell>
                      <TableCell>{payment.paymentMethod || "N/A"}</TableCell>
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
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => 
                                updatePaymentMutation.mutate({ 
                                  paymentId: payment.id, 
                                  status: "approved" 
                                })
                              }
                              disabled={updatePaymentMutation.isPending}
                              data-testid="button-approve-payment"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => 
                                updatePaymentMutation.mutate({ 
                                  paymentId: payment.id, 
                                  status: "rejected",
                                  rejectionReason: "Review required"
                                })
                              }
                              disabled={updatePaymentMutation.isPending}
                              data-testid="button-reject-payment"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
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
