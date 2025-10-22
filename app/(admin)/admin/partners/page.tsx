"use client";
import { useQuery } from "@tanstack/react-query";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/card";
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
import type { Partner } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";

interface PartnerWithUser extends Partner {
  user?: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
}

export default function AdminPartners() {
  const [selectedPartner, setSelectedPartner] = useState<PartnerWithUser | null>(null);

  const { data: partnersResponse, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/partners"],
    queryFn: async () => {
      const res = await fetch("/api/admin/partners");
      if (!res.ok) {
        throw new Error('Failed to fetch partners');
      }
      return res.json();
    },
  });

  const partners = partnersResponse?.partners || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "inactive":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
      case "suspended":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <>
      <div className="space-y-6">
        <AdminPageHeader 
          title="Partners Management"
          description="Manage affiliate partners and their performance"
          onRefresh={() => refetch()}
        />

        <Card className="border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableHead className="text-gray-700 dark:text-gray-300">Business Name</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Business Type</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Contact</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Commission Rate</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Total Sales</TableHead>
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
                ) : partners && partners.length > 0 ? (
                  partners.map((partner: any) => (
                    <TableRow 
                      key={partner.id} 
                      data-testid={`row-partner-${partner.id}`}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 border-gray-200 dark:border-gray-800"
                      onClick={() => setSelectedPartner(partner)}
                    >
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100" data-testid="text-partner-business">
                        {partner.businessName}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{partner.businessType}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-gray-900 dark:text-gray-100">{partner.user?.fullName}</div>
                          <div className="text-gray-500 dark:text-gray-400">{partner.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900 dark:text-gray-100">{partner.commissionRate}%</TableCell>
                      <TableCell className="font-semibold text-gray-900 dark:text-gray-100" data-testid="text-partner-sales">Rs. {partner.totalSales}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(partner.status)}>
                          {partner.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-gray-200 dark:border-gray-800">
                    <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No partners found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* View Partner Details Dialog */}
      {selectedPartner && (
        <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800" data-testid="dialog-partner-details">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Partner Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Partner ID</label>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    #{selectedPartner.id.slice(0, 8)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedPartner.status)}>
                      {selectedPartner.status}
                    </Badge>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Name</label>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {selectedPartner.businessName}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Type</label>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {selectedPartner.businessType}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Commission Rate</label>
                  <p className="text-base font-bold text-cyan-600 dark:text-cyan-400">
                    {selectedPartner.commissionRate}%
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sales</label>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    Rs. {selectedPartner.totalSales}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</label>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {format(new Date(selectedPartner.createdAt), "MMM dd, yyyy")}
                  </p>
                </div>

                {selectedPartner.user && (
                  <>
                    <div className="col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h3>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Person</label>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {selectedPartner.user.fullName}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {selectedPartner.user.email}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</label>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {selectedPartner.user.phoneNumber || "N/A"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
