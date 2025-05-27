import React, { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { listExpenses } from './graphql/queries';
import { createExpense } from './graphql/mutations';

const client = generateClient(); // ✅ Now in the correct place


function App({ signOut, user }) {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: ''
  });

  // Fetch expenses when component loads
  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    try {
      const expenseData = await client.graphql({ query: listExpenses });

      setExpenses(expenseData.data.listExpenses.items);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  }

  async function addExpense() {
    if (!formData.title || !formData.amount || !formData.date) return;
    const expenseInput = {
      title: formData.title,
      amount: parseFloat(formData.amount),
      date: formData.date
    };

    try {
      await client.graphql({
  query: createExpense,
  variables: { input: expenseInput }
});

      setFormData({ title: '', amount: '', date: '' });
      fetchExpenses(); // Refresh list
    } catch (err) {
      console.error('Error creating expense:', err);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome to Online Expense Tracker, {user.username}!</h2>
      <button onClick={signOut}>Sign Out</button>

      <h3>Add Expense</h3>
      <input
        placeholder="Title"
        value={formData.title}
        onChange={e => setFormData({ ...formData, title: e.target.value })}
      />
      <input
        type="number"
        placeholder="Amount"
        value={formData.amount}
        onChange={e => setFormData({ ...formData, amount: e.target.value })}
      />
      <input
        type="date"
        value={formData.date}
        onChange={e => setFormData({ ...formData, date: e.target.value })}
      />
      <button onClick={addExpense}>Add Expense</button>

      <h3>My Expenses</h3>
      <ul>
        {expenses.map(exp => (
          <li key={exp.id}>
            {exp.title} - ₹{exp.amount} on {exp.date}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default withAuthenticator(App);
