"use client";
import { useQuery } from "@tanstack/react-query";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useState } from "react";
import type { User } from "@shared/schema";
import { format } from "date-fns";

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: users, isLoading, refetch } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const filteredUsers = users?.filter((user) =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phoneNumber?.includes(searchTerm)
  );

  return (
    <>
      <div className="space-y-6">
        <AdminPageHeader 
          title="Users Management"
          description="Manage all registered users"
          onRefresh={() => refetch()}
        />

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            data-testid="input-search-users"
          />
        </div>

        <Card className="border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableHead className="text-gray-700 dark:text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Phone</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Wallet Balance</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Partner</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i} className="border-gray-200 dark:border-gray-800">
                      <TableCell colSpan={6}>
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow 
                      key={user.id} 
                      data-testid={`row-user-${user.id}`}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 border-gray-200 dark:border-gray-800"
                      onClick={() => setSelectedUser(user)}
                    >
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100" data-testid="text-user-name">
                        {user.fullName}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300" data-testid="text-user-email">{user.email}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{user.phoneNumber || "N/A"}</TableCell>
                      <TableCell className="font-semibold text-gray-900 dark:text-gray-100">Rs. {user.walletBalance}</TableCell>
                      <TableCell>
                        {user.isPartner ? (
                          <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                            Partner
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Regular</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-gray-200 dark:border-gray-800">
                    <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* View User Details Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800" data-testid="dialog-user-details">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">User Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</label>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    #{selectedUser.id.slice(0, 8)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {selectedUser.fullName}
                  </p>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {selectedUser.email}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</label>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {selectedUser.phoneNumber || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">WhatsApp Number</label>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {selectedUser.whatsappNumber || "N/A"}
                  </p>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                  <p className="text-base text-gray-900 dark:text-white">
                    {selectedUser.address || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">City</label>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {selectedUser.city || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Province</label>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {selectedUser.province || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Postal Code</label>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {selectedUser.postalCode || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Affiliate Code</label>
                  <p className="text-base font-bold text-cyan-600 dark:text-cyan-400">
                    {selectedUser.affiliateCode}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Wallet Balance</label>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    Rs. {selectedUser.walletBalance}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Earnings</label>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    Rs. {selectedUser.totalEarnings}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Earnings</label>
                  <p className="text-base font-bold text-amber-600 dark:text-amber-400">
                    Rs. {selectedUser.pendingEarnings}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Partner Status</label>
                  <div className="mt-1">
                    {selectedUser.isPartner ? (
                      <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                        Partner
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                        Regular User
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</label>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {format(new Date(selectedUser.createdAt), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
