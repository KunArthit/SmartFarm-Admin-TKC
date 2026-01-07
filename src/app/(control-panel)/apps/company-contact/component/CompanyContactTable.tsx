/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';

interface CompanyContact {
	contact_id: number;
	company_user_id: number;
	contact_name: string;
	position: string;
	email: string;
	phone: string | null;
	is_primary: number;
	created_at: string;
}

const CompanyContactTable: React.FC = () => {
	const [contacts, setContacts] = useState<CompanyContact[]>([]);
	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
	useEffect(() => {
		fetch(`${API_BASE_URL}/company-contact/`)
			.then((response) => response.json())
			.then((data) => setContacts(data))
			.catch((error) => console.error('Error fetching company contacts:', error));
	}, []);

	const handleDelete = (id: number) => {
		fetch(`${API_BASE_URL}/company-contact/${id}`, {
			method: 'DELETE'
		})
			.then((response) => {
				if (response.ok) {
					setContacts(contacts.filter((contact) => contact.contact_id !== id));
				} else {
					console.error('Failed to delete contact');
				}
			})
			.catch((error) => console.error('Error deleting contact:', error));
	};

	return (
		<TableContainer component={Paper}>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>ID</TableCell>
						<TableCell>Company User ID</TableCell>
						<TableCell>Contact Name</TableCell>
						<TableCell>Position</TableCell>
						<TableCell>Email</TableCell>
						<TableCell>Phone</TableCell>
						<TableCell>Primary Contact</TableCell>
						<TableCell>Created At</TableCell>
						<TableCell>Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{contacts.map((contact) => (
						<TableRow key={contact.contact_id}>
							<TableCell>{contact.contact_id}</TableCell>
							<TableCell>{contact.company_user_id}</TableCell>
							<TableCell>{contact.contact_name}</TableCell>
							<TableCell>{contact.position}</TableCell>
							<TableCell>{contact.email}</TableCell>
							<TableCell>{contact.phone || 'N/A'}</TableCell>
							<TableCell>{contact.is_primary ? 'Yes' : 'No'}</TableCell>
							<TableCell>{new Date(contact.created_at).toLocaleString()}</TableCell>
							<TableCell>
								<Button
									color='secondary'
									onClick={() => handleDelete(contact.contact_id)}
								>
									Delete
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default CompanyContactTable;
