import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema } from '../../lib/validations';
import { useCustomers } from '../../hooks/useCustomers';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { CustomerTable } from './CustomerTable';
import { CustomerFilters } from './CustomerFilters';
import { AddCustomerModal } from './AddCustomerModal';
import toast from 'react-hot-toast';

export function CustomersPage() {
  const { customers, loading, error, addCustomer } = useCustomers();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    sortBy: 'name'
  });

  const form = useForm({
    resolver: zodResolver(customerSchema)
  });

  const handleAddCustomer = async (data) => {
    try {
      await addCustomer(data);
      setIsAddModalOpen(false);
      toast.success('Customer added successfully');
    } catch (error) {
      toast.error('Failed to add customer');
    }
  };

  const filteredCustomers = customers.filter(customer => {
    if (filters.status !== 'all' && customer.status !== filters.status) {
      return false;
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        customer.name.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search)
      );
    }
    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'spent':
        return b.spent - a.spent;
      case 'lastOrder':
        return new Date(b.last_order_at) - new Date(a.last_order_at);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <main className="flex-1 min-w-0 overflow-auto">
      <div className="max-w-[1440px] mx-auto animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
          <h1 className="text-gray-900 dark:text-white text-2xl md:text-3xl font-bold">
            Customers
          </h1>
          <Button onClick={() => setIsAddModalOpen(true)}>
            Add Customer
          </Button>
        </div>

        <div className="p-4">
          <Card>
            <CardHeader>
              <CustomerFilters filters={filters} onChange={setFilters} />
            </CardHeader>
            <CardContent>
              <CustomerTable customers={filteredCustomers} />
            </CardContent>
          </Card>
        </div>
      </div>

      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddCustomer}
      />
    </main>
  );
}