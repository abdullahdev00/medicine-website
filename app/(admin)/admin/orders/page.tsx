"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar } from "lucide-react";
import { useState, useMemo } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "year" | "custom">("today");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const { data: ordersResponse, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) {
        throw new Error('Failed to fetch orders');
      }
      return res.json();
    },
  });

  const orders = ordersResponse?.orders || [];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/orders/${orderId}/status`, { status });
      return await res.json();
    },
    onMutate: async ({ orderId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/admin/orders"] });

      // Snapshot the previous value
      const previousOrders = queryClient.getQueryData<Order[]>(["/api/admin/orders"]);

      // Optimistically update to the new value
      queryClient.setQueryData<Order[]>(["/api/admin/orders"], (old) => {
        if (!old) return old;
        return old.map((order) =>
          order.id === orderId ? { ...order, status } : order
        );
      });

      // Return a context object with the snapshotted value
      return { previousOrders };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousOrders) {
        queryClient.setQueryData(["/api/admin/orders"], context.previousOrders);
      }
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "in_transit":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "delivered":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let filtered = orders;

    // Date filter
    const now = new Date();
    let dateRange: { start: Date; end: Date } | null = null;

    switch (dateFilter) {
      case "today":
        dateRange = {
          start: startOfDay(now),
          end: endOfDay(now),
        };
        break;
      case "week":
        dateRange = {
          start: startOfWeek(now),
          end: endOfWeek(now),
        };
        break;
      case "month":
        dateRange = {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
        break;
      case "year":
        dateRange = {
          start: startOfYear(now),
          end: endOfYear(now),
        };
        break;
      case "custom":
        if (selectedDate) {
          dateRange = {
            start: startOfDay(selectedDate),
            end: endOfDay(selectedDate),
          };
        }
        break;
    }

    if (dateRange) {
      filtered = filtered.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        return isWithinInterval(orderDate, dateRange);
      });
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((order: any) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          order.id.toLowerCase().includes(searchLower) ||
          (Array.isArray(order.products) &&
            order.products.some((p: any) =>
              p.name?.toLowerCase().includes(searchLower)
            ))
        );
      });
    }

    return filtered;
  }, [orders, dateFilter, selectedDate, searchTerm]);

  return (
    
    
      <div className="space-y-6">
        <AdminPageHeader 
          title="Orders Management"
          description="Track and manage all orders"
          onRefresh={() => refetch()}
        />

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-orders"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={dateFilter === "today" ? "default" : "outline"}
              onClick={() => setDateFilter("today")}
              data-testid="button-filter-today"
            >
              Today
            </Button>
            <Button
              variant={dateFilter === "week" ? "default" : "outline"}
              onClick={() => setDateFilter("week")}
              data-testid="button-filter-week"
            >
              Week
            </Button>
            <Button
              variant={dateFilter === "month" ? "default" : "outline"}
              onClick={() => setDateFilter("month")}
              data-testid="button-filter-month"
            >
              Month
            </Button>
            <Button
              variant={dateFilter === "year" ? "default" : "outline"}
              onClick={() => setDateFilter("year")}
              data-testid="button-filter-year"
            >
              Year
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={dateFilter === "custom" ? "default" : "outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                  data-testid="button-filter-custom"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateFilter === "custom" && selectedDate
                    ? format(selectedDate, "MMM dd, yyyy")
                    : "Pick Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    if (date) {
                      setDateFilter("custom");
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Total Amount</TableHead>
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
                ) : filteredOrders && filteredOrders.length > 0 ? (
                  filteredOrders.map((order: any) => (
                    <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                      <TableCell className="font-medium" data-testid="text-order-id">
                        #{order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {Array.isArray(order.products) 
                            ? order.products.map((p: any) => p.name).join(", ")
                            : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell data-testid="text-order-total">Rs. {order.totalPrice}</TableCell>
                      <TableCell className="capitalize">{order.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(order.createdAt), "MMM dd, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={order.status}
                          onValueChange={(value) => 
                            updateStatusMutation.mutate({ orderId: order.id, status: value })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          <SelectTrigger className="w-[140px]" data-testid="select-order-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="in_transit">In Transit</SelectItem>
                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="returned">Returned</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      No orders found for selected filter
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredOrders?.length || 0} of {orders?.length || 0} orders
        </div>
      </div>
    
    
  );
}
