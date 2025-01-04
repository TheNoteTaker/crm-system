import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { CustomerFilters } from './CustomerFilters';
import { CustomerTable } from './CustomerTable';
import { AddCustomerModal } from './AddCustomerModal';
import { useAuth } from '../../context/AuthContext';
import { listCustomers } from '../../lib/queries';
import { Pagination } from '../ui/Pagination';
import toast from 'react-hot-toast';

export function CustomersPage() {
  const { profile } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    sortBy: 'name'
  });

  useEffect(() => {
    if (!profile?.tenant_id) return;
    
    let timer = setTimeout(() => {
      fetchCustomers();
    }, filters.search ? 300 : 0);
    
    return () => clearTimeout(timer);
  }, [profile?.tenant_id, pagination.page, filters.status, filters.sortBy, filters.search]);

  const fetchCustomers = async () => {
    if (!profile?.tenant_id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const result = await listCustomers(
        profile.tenant_id,
        {
          page: pagination.page,
          limit: pagination.limit,
          orderBy: filters.sortBy,
          orderDirection: 'asc'
        },
        {
          name: filters.search?.trim() || undefined,
          status: filters.status === 'all' ? undefined : filters.status
        }
      );

      if (result.error) {
        throw result.error;
      }

      setCustomers(result.data || []);
      setPagination(prev => ({
        ...prev,
        total: result.pagination?.total || 0,
        totalPages: Math.max(1, result.pagination?.totalPages || 0)
      }));
    } catch (error) {
      console.error('Error in fetchCustomers:', error);
      toast.error('Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = (newCustomer) => {
    setCustomers([...customers, newCustomer]);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <main className="flex-1 min-w-0 overflow-auto">
      <div className="max-w-[1440px] mx-auto animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
          <h1 className="text-gray-900 dark:text-white text-2xl md:text-3xl font-bold">Customers</h1>
          <Button onClick={() => setIsAddModalOpen(true)}>
            Add Customer
          </Button>
        </div>

        <div className="p-4">
          <Card>
            <CardHeader>
              <CustomerFilters filters={filters} onChange={setFilters} />
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading customers...</p>
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {filters.search 
                    ? `No customers found matching "${filters.search}"`
                    : 'No customers found'}
                </div>
              ) : (
                <>
                  <CustomerTable customers={customers} />
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCustomer}
      />
    </main>
  );
}