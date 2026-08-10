"use client";

import React, { useState, useEffect } from "react";
import { getAllUsers, updateUserAccountStatus } from "@/lib/admin/admin-users";
import { AdminUserListItem } from "@/types/admin";
import { AdminTable } from "@/components/admin/AdminTable";
import { EmptyState } from "@/components/service-provider/EmptyState";
import { Users, Search, Filter, ShieldAlert, Loader2, Eye, X } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const handleToggleStatus = async (uid: string, currentStatus?: string) => {
    const nextStatus = currentStatus === "suspended" ? "active" : "suspended";
    try {
      await updateUserAccountStatus(uid, nextStatus);
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, status: nextStatus } : u))
      );
    } catch (err) {
      console.error("Failed to update user account status:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.mobileNumber?.includes(searchQuery);

    const matchesType =
      userTypeFilter === "all" || u.userType === userTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
          Registered Users
        </h2>
        <p className="text-xs sm:text-sm text-purple-900/60 mt-1">
          View and manage registered Customer and Provider user accounts.
        </p>
      </div>

      <AdminTable
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search users by name, email, or mobile..."
        filterComponent={
          <select
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value)}
            className="px-4 py-2 rounded-2xl bg-purple-50/40 border border-purple-200 text-purple-950 text-xs font-bold focus:outline-none"
          >
            <option value="all">All User Types</option>
            <option value="customer">Customer Only</option>
            <option value="provider">Service Provider Only</option>
          </select>
        }
      >
        {filteredUsers.length > 0 ? (
          <table className="w-full text-left text-xs font-medium text-purple-950">
            <thead className="bg-purple-50/60 text-purple-950 uppercase text-[10px] tracking-wider font-extrabold border-b border-purple-100">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">City</th>
                <th className="p-4">Gender</th>
                <th className="p-4">Account Type</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100/60">
              {filteredUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-purple-50/30 transition-colors">
                  <td className="p-4 font-bold">{u.fullName}</td>
                  <td className="p-4 text-purple-900/70">{u.email}</td>
                  <td className="p-4">{u.mobileNumber || "—"}</td>
                  <td className="p-4">{u.city || "—"}</td>
                  <td className="p-4">{u.gender || "—"}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        u.userType === "provider"
                          ? "bg-pink-100 text-pink-700"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {u.userType?.toUpperCase() || "CUSTOMER"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        u.status === "suspended"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {u.status === "suspended" ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-950 font-bold hover:bg-purple-100"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleToggleStatus(u.uid, u.status)}
                      className={`px-3 py-1 rounded-full font-bold text-[11px] ${
                        u.status === "suspended"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {u.status === "suspended" ? "Unsuspend" : "Suspend"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={Users}
            title="No Users Found"
            description="No registered user records matching search criteria."
          />
        )}
      </AdminTable>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-purple-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-purple-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <h3 className="text-lg font-extrabold text-purple-950">User Profile Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-950"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-purple-50/50">
                <span className="text-[10px] text-purple-900/50 uppercase font-bold block">User ID</span>
                <span className="font-mono text-purple-950 font-bold">{selectedUser.uid}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-purple-900/50 uppercase font-bold block">Full Name</span>
                  <span className="font-extrabold text-purple-950 text-sm">{selectedUser.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-purple-900/50 uppercase font-bold block">Email</span>
                  <span className="font-bold text-purple-950">{selectedUser.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-purple-900/50 uppercase font-bold block">Mobile</span>
                  <span className="font-bold text-purple-950">{selectedUser.mobileNumber || "Not Provided"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-purple-900/50 uppercase font-bold block">City</span>
                  <span className="font-bold text-purple-950">{selectedUser.city || "Not Provided"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-purple-900/50 uppercase font-bold block">Gender</span>
                  <span className="font-bold text-purple-950">{selectedUser.gender || "Not Provided"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-purple-900/50 uppercase font-bold block">Account Type</span>
                  <span className="font-extrabold text-pink-600">{selectedUser.userType?.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-purple-100 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-6 py-2.5 rounded-full bg-purple-700 text-white font-extrabold text-xs shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
