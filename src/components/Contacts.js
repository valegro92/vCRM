import React, { useState, useMemo } from 'react';
import { Filter, Plus, Building2, Mail, Phone, Eye, Edit2, Trash2, X, Search, SortAsc, SortDesc, Users } from 'lucide-react';

export default function Contacts({ contacts, openAddModal, handleDeleteContact }) {
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedContact, setSelectedContact] = useState(null);

    const filteredContacts = useMemo(() => {
        let result = [...contacts];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.name?.toLowerCase().includes(term) ||
                c.company?.toLowerCase().includes(term) ||
                c.email?.toLowerCase().includes(term)
            );
        }

        // Status filter
        if (statusFilter) {
            result = result.filter(c => c.status === statusFilter);
        }

        // Sorting
        result.sort((a, b) => {
            let aVal = a[sortBy] || '';
            let bVal = b[sortBy] || '';

            if (sortBy === 'value') {
                aVal = Number(aVal) || 0;
                bVal = Number(bVal) || 0;
            } else {
                aVal = String(aVal).toLowerCase();
                bVal = String(bVal).toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return result;
    }, [contacts, searchTerm, statusFilter, sortBy, sortOrder]);

    const statuses = ['Lead', 'Prospect', 'Cliente', 'Inattivo'];

    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const clearFilters = () => {
        setStatusFilter('');
        setSearchTerm('');
        setSortBy('name');
        setSortOrder('asc');
    };

    const hasActiveFilters = statusFilter || searchTerm;

    return (
        <div className="contacts-view">
            {/* Toolbar */}
            <div className="view-toolbar">
                <div className="toolbar-left">
                    <div className="search-box" style={{ flex: 1, maxWidth: '300px' }}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Cerca contatti..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <X size={16} style={{ cursor: 'pointer' }} onClick={() => setSearchTerm('')} />
                        )}
                    </div>
                    <button
                        className={`filter-btn ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={18} />
                        <span className="hide-mobile">Filtri</span>
                        {hasActiveFilters && <span style={{ background: 'var(--primary-500)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>!</span>}
                    </button>
                </div>
                <div className="toolbar-right">
                    <button className="primary-btn" onClick={() => openAddModal('contact')}>
                        <Plus size={18} />
                        <span className="hide-mobile">Nuovo Contatto</span>
                    </button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div style={{ 
                    background: 'white', 
                    borderRadius: '12px', 
                    padding: '16px', 
                    display: 'flex', 
                    gap: '16px', 
                    alignItems: 'center', 
                    flexWrap: 'wrap',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--gray-100)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)' }}>Stato</label>
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ 
                                padding: '8px 12px', 
                                border: '1px solid var(--gray-200)', 
                                borderRadius: '8px', 
                                fontSize: '14px', 
                                minWidth: '150px' 
                            }}
                        >
                            <option value="">Tutti</option>
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    {hasActiveFilters && (
                        <button 
                            onClick={clearFilters}
                            style={{ background: 'none', border: 'none', color: 'var(--gray-500)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Cancella filtri
                        </button>
                    )}
                </div>
            )}

            {/* Stats Bar */}
            <div style={{ 
                display: 'flex', 
                gap: '24px', 
                padding: '12px 16px', 
                background: 'var(--gray-50)', 
                borderRadius: '10px',
                flexWrap: 'wrap'
            }}>
                <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                    <strong style={{ color: 'var(--gray-900)' }}>{filteredContacts.length}</strong> contatti 
                    {hasActiveFilters && ` (di ${contacts.length})`}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                    Valore totale: <strong style={{ color: 'var(--gray-900)' }}>€{filteredContacts.reduce((sum, c) => sum + (parseFloat(c.value) || 0), 0).toLocaleString()}</strong>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="data-table">
                <table>
                    <thead>
                        <tr>
                            <th className={sortBy === 'name' ? 'sorted' : ''} onClick={() => toggleSort('name')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    Nome
                                    {sortBy === 'name' && (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                                </div>
                            </th>
                            <th onClick={() => toggleSort('company')}>Azienda</th>
                            <th>Email</th>
                            <th>Telefono</th>
                            <th onClick={() => toggleSort('value')}>Valore</th>
                            <th onClick={() => toggleSort('status')}>Stato</th>
                            <th>Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContacts.length === 0 ? (
                            <tr>
                                <td colSpan="7">
                                    <div className="empty-state">
                                        <Users size={48} strokeWidth={1} />
                                        <p>{hasActiveFilters ? 'Nessun contatto trovato' : 'Nessun contatto'}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredContacts.map(contact => (
                                <tr key={contact.id}>
                                    <td>
                                        <div className="contact-cell">
                                            <div className="contact-avatar">{contact.avatar || '??'}</div>
                                            <span className="contact-name">{contact.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="company-cell">
                                            <Building2 size={16} />
                                            <span>{contact.company || '-'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="email-cell">
                                            <Mail size={16} />
                                            <span>{contact.email || '-'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="phone-cell">
                                            <Phone size={16} />
                                            <span>{contact.phone || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="value-cell">€{(contact.value || 0).toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge ${contact.status?.toLowerCase() || 'lead'}`}>{contact.status || 'Lead'}</span>
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <button className="action-btn" onClick={() => setSelectedContact(contact)}><Eye size={16} /></button>
                                            <button className="action-btn" onClick={() => openAddModal('contact', contact)}><Edit2 size={16} /></button>
                                            <button className="action-btn delete" onClick={() => handleDeleteContact(contact.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card List */}
            <div className="mobile-card-list">
                {filteredContacts.length === 0 ? (
                    <div className="empty-state">
                        <Users size={48} strokeWidth={1} />
                        <p>{hasActiveFilters ? 'Nessun contatto trovato' : 'Nessun contatto'}</p>
                    </div>
                ) : (
                    filteredContacts.map(contact => (
                        <div key={contact.id} className="mobile-card" onClick={() => setSelectedContact(contact)}>
                            <div className="mobile-card-header">
                                <div className="mobile-card-avatar">{contact.avatar || '??'}</div>
                                <div className="mobile-card-info">
                                    <div className="mobile-card-title">{contact.name}</div>
                                    <div className="mobile-card-subtitle">{contact.company || 'Nessuna azienda'}</div>
                                </div>
                                <span className={`status-badge ${contact.status?.toLowerCase() || 'lead'}`}>
                                    {contact.status || 'Lead'}
                                </span>
                            </div>
                            <div className="mobile-card-body">
                                {contact.email && (
                                    <div className="mobile-card-row">
                                        <Mail size={16} />
                                        <span>{contact.email}</span>
                                    </div>
                                )}
                                {contact.phone && (
                                    <div className="mobile-card-row">
                                        <Phone size={16} />
                                        <span>{contact.phone}</span>
                                    </div>
                                )}
                            </div>
                            <div className="mobile-card-footer">
                                <div className="mobile-card-value">€{(contact.value || 0).toLocaleString()}</div>
                                <div className="mobile-card-actions">
                                    <button className="action-btn" onClick={(e) => { e.stopPropagation(); openAddModal('contact', contact); }}>
                                        <Edit2 size={18} />
                                    </button>
                                    <button className="action-btn delete" onClick={(e) => { e.stopPropagation(); handleDeleteContact(contact.id); }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Contact Detail Modal */}
            {selectedContact && (
                <div className="modal-overlay" onClick={() => setSelectedContact(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Dettagli Contatto</h2>
                            <button className="close-btn" onClick={() => setSelectedContact(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                <div className="mobile-card-avatar" style={{ width: '64px', height: '64px', fontSize: '24px' }}>
                                    {selectedContact.avatar || '??'}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '4px' }}>
                                        {selectedContact.name}
                                    </h3>
                                    <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
                                        {selectedContact.company || 'Nessuna azienda'}
                                    </p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '12px' }}>
                                    Informazioni di contatto
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginBottom: '4px' }}>Email</div>
                                        <div style={{ fontSize: '14px', color: 'var(--gray-900)', fontWeight: 500 }}>{selectedContact.email || '-'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginBottom: '4px' }}>Telefono</div>
                                        <div style={{ fontSize: '14px', color: 'var(--gray-900)', fontWeight: 500 }}>{selectedContact.phone || '-'}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '12px' }}>
                                    Informazioni commerciali
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginBottom: '4px' }}>Valore</div>
                                        <div style={{ fontSize: '18px', color: 'var(--gray-900)', fontWeight: 700 }}>€{(selectedContact.value || 0).toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginBottom: '4px' }}>Stato</div>
                                        <span className={`status-badge ${selectedContact.status?.toLowerCase() || 'lead'}`}>{selectedContact.status || 'Lead'}</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginBottom: '4px' }}>Ultimo contatto</div>
                                        <div style={{ fontSize: '14px', color: 'var(--gray-900)', fontWeight: 500 }}>{selectedContact.lastContact || '-'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="secondary-btn" onClick={() => setSelectedContact(null)}>Chiudi</button>
                            <button className="primary-btn" onClick={() => { openAddModal('contact', selectedContact); setSelectedContact(null); }}>
                                <Edit2 size={16} />
                                <span>Modifica</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
