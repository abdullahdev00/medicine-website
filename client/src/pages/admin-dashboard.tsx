import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  LayoutDashboard, Users, ShoppingBag, Package, DollarSign, Settings,
  LogOut, TrendingUp, Clock, CheckCircle, XCircle, Eye, Edit, Trash2, Plus
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Redirect if not admin
  if (!isAdmin) {
    setLocation("/");
    return null;
  }

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/dashboard/stats"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/admin/orders"],
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/admin/products"],
  });

  const { data: paymentRequests = [] } = useQuery({
    queryKey: ["/api/admin/payment-requests"],
  });

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-primary text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-admin-title">MediSwift Admin Panel</h1>
            <p className="text-sm opacity-90">Welcome, {user?.fullName}</p>
          </div>
          <Button
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            onClick={handleLogout}
            data-testid="button-admin-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-auto p-1 bg-white rounded-lg shadow">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-white py-3" data-testid="tab-dashboard">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-white py-3" data-testid="tab-orders">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-white py-3" data-testid="tab-users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-white py-3" data-testid="tab-products">
              <Package className="w-4 h-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-primary data-[state=active]:text-white py-3" data-testid="tab-payments">
              <DollarSign className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-white py-3" data-testid="tab-settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-users">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">Registered customers</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-orders">{stats?.totalOrders || 0}</div>
                  <p className="text-xs text-muted-foreground">{stats?.pendingOrders || 0} pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-revenue">PKR {stats?.totalRevenue?.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground">From delivered orders</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-pending-payments">{stats?.pendingPayments || 0}</div>
                  <p className="text-xs text-muted-foreground">Awaiting review</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders from customers</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentOrdersTable orders={stats?.recentOrders || []} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>View and manage all customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <OrdersTable orders={orders} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <UsersTable users={users} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>Manage your medicine inventory</CardDescription>
                </div>
                <Button data-testid="button-add-product">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent>
                <ProductsTable products={products} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Requests</CardTitle>
                <CardDescription>Review and process payment requests</CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentRequestsTable requests={paymentRequests} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Settings page coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Recent Orders Table Component
function RecentOrdersTable({ orders }: { orders: any[] }) {
  if (orders.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent orders</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}</TableCell>
            <TableCell>{order.userId}</TableCell>
            <TableCell>PKR {parseFloat(order.totalPrice).toLocaleString()}</TableCell>
            <TableCell>
              <Badge variant={order.status === 'pending' ? 'secondary' : order.status === 'delivered' ? 'default' : 'outline'}>
                {order.status}
              </Badge>
            </TableCell>
            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Orders Table Component
function OrdersTable({ orders }: { orders: any[] }) {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/orders/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/stats"] });
      toast({
        title: "Order updated",
        description: "Order status has been updated successfully",
      });
      setSelectedOrder(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  if (orders.length === 0) {
    return <p className="text-sm text-muted-foreground">No orders found</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}</TableCell>
              <TableCell>PKR {parseFloat(order.totalPrice).toLocaleString()}</TableCell>
              <TableCell>{order.paymentMethod}</TableCell>
              <TableCell>
                <Badge variant={
                  order.status === 'pending' ? 'secondary' :
                  order.status === 'processing' ? 'outline' :
                  order.status === 'in-transit' ? 'default' :
                  order.status === 'delivered' ? 'default' :
                  order.status === 'return' ? 'outline' :
                  'destructive'
                }>
                  {order.status === 'in-transit' ? 'In Transit' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrder(order)}
                  data-testid={`button-view-order-${order.id}`}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Order ID: {selectedOrder?.id}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select
                  defaultValue={selectedOrder.status}
                  onValueChange={(status) => updateOrderMutation.mutate({ id: selectedOrder.id, status })}
                >
                  <SelectTrigger data-testid="select-order-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="in-transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="return">Return</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Delivery Address</Label>
                <p className="text-sm">{selectedOrder.deliveryAddress}</p>
              </div>
              <div>
                <Label>Products</Label>
                <div className="space-y-2 mt-2">
                  {selectedOrder.products?.map((product: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm border-b pb-2">
                      <span>{product.name} x {product.quantity}</span>
                      <span>PKR {parseFloat(product.price).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Users Table Component
function UsersTable({ users }: { users: any[] }) {
  if (users.length === 0) {
    return <p className="text-sm text-muted-foreground">No users found</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>City</TableHead>
          <TableHead>Wallet Balance</TableHead>
          <TableHead>Total Earnings</TableHead>
          <TableHead>Partner</TableHead>
          <TableHead>Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.fullName}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.city}</TableCell>
            <TableCell>PKR {parseFloat(user.walletBalance).toLocaleString()}</TableCell>
            <TableCell>PKR {parseFloat(user.totalEarnings).toLocaleString()}</TableCell>
            <TableCell>
              {user.isPartner ? <Badge>Partner</Badge> : <Badge variant="outline">Customer</Badge>}
            </TableCell>
            <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Products Table Component
function ProductsTable({ products }: { products: any[] }) {
  const { toast } = useToast();

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  if (products.length === 0) {
    return <p className="text-sm text-muted-foreground">No products found</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead>Stock Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.categoryId}</TableCell>
            <TableCell>{product.rating}</TableCell>
            <TableCell>
              {product.inStock ? (
                <Badge variant="default">In Stock</Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" data-testid={`button-edit-product-${product.id}`}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this product?")) {
                      deleteProductMutation.mutate(product.id);
                    }
                  }}
                  data-testid={`button-delete-product-${product.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Payment Requests Table Component
function PaymentRequestsTable({ requests }: { requests: any[] }) {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes, rejectionReason }: any) => {
      const response = await apiRequest("PATCH", `/api/admin/payment-requests/${id}/status`, {
        status,
        adminNotes,
        rejectionReason,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/stats"] });
      toast({
        title: "Request updated",
        description: "Payment request has been updated successfully",
      });
      setSelectedRequest(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment request",
        variant: "destructive",
      });
    },
  });

  if (requests.length === 0) {
    return <p className="text-sm text-muted-foreground">No payment requests found</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-mono text-xs">{request.id.substring(0, 8)}</TableCell>
              <TableCell>
                <Badge variant={request.type === 'deposit' ? 'default' : 'outline'}>
                  {request.type}
                </Badge>
              </TableCell>
              <TableCell>PKR {parseFloat(request.amount).toLocaleString()}</TableCell>
              <TableCell>{request.paymentMethod}</TableCell>
              <TableCell>
                <Badge variant={
                  request.status === 'pending' ? 'secondary' :
                  request.status === 'approved' ? 'default' :
                  'destructive'
                }>
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRequest(request)}
                  data-testid={`button-view-request-${request.id}`}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Payment Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Request Review</DialogTitle>
            <DialogDescription>Request ID: {selectedRequest?.id}</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label>Type</Label>
                <p className="text-sm">{selectedRequest.type}</p>
              </div>
              <div>
                <Label>Amount</Label>
                <p className="text-sm">PKR {parseFloat(selectedRequest.amount).toLocaleString()}</p>
              </div>
              <div>
                <Label>Payment Method</Label>
                <p className="text-sm">{selectedRequest.paymentMethod}</p>
              </div>
              {selectedRequest.receiptUrl && (
                <div>
                  <Label>Receipt</Label>
                  <img src={selectedRequest.receiptUrl} alt="Receipt" className="mt-2 max-w-full h-auto rounded border" />
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => updateRequestMutation.mutate({
                    id: selectedRequest.id,
                    status: 'approved',
                    adminNotes: 'Approved by admin',
                  })}
                  disabled={selectedRequest.status !== 'pending'}
                  data-testid="button-approve-request"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => updateRequestMutation.mutate({
                    id: selectedRequest.id,
                    status: 'rejected',
                    rejectionReason: 'Invalid receipt',
                  })}
                  disabled={selectedRequest.status !== 'pending'}
                  data-testid="button-reject-request"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
