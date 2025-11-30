import React, { useState, useMemo } from 'react';
import { Filter, Plus, Building2, Edit2, Trash2, Search, Euro, TrendingUp, Target, X, Calendar } from 'lucide-react';
import pipelineStages from '../constants/pipelineStages';

export default function Opportunities({ opportunities, openAddModal, handleDeleteOpportunity }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStage, setFilterStage] = useState('all');
    const [sortBy, setSortBy] = useState('value');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedYear, setSelectedYear] = useState('all'); // Year filter

    // Stats
    const stats = useMemo(() => {
        const active = opportunities.filter(o => !o.stage?.toLowerCase().includes('chiuso'));
        const totalValue = active.reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);
        const avgProbability = active.length > 0
            ? Math.round(active.reduce((sum, o) => sum + (parseFloat(o.probability) || 0), 0) / active.length)
            : 0;
        const weighted = active.reduce((sum, o) => sum + ((parseFloat(o.value) || 0) * (parseFloat(o.probability) || 0) / 100), 0);
        return { count: active.length, totalValue, avgProbability, weighted };
    }, [opportunities]);

    // Filtered and sorted opportunities
    const filteredOpportunities = useMemo(() => {
        let result = [...opportunities];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(o =>
                o.title?.toLowerCase().includes(term) ||
                o.company?.toLowerCase().includes(term) ||
                o.owner?.toLowerCase().includes(term)
            );
        }

        // Year filter
        if (selectedYear !== 'all') {
            result = result.filter(o => {
                if (!o.closeDate) return false;
                const oppYear = new Date(o.closeDate).getFullYear();
                return oppYear === parseInt(selectedYear);
            });
        }

        if (filterStage !== 'all') {
            result = result.filter(o => o.stage === filterStage);
        }

        result.sort((a, b) => {
            let aVal, bVal;
            switch (sortBy) {
                case 'value':
                    aVal = a.value || 0;
                    bVal = b.value || 0;
                    break;
                case 'probability':
                    aVal = a.probability || 0;
                    bVal = b.probability || 0;
                    break;
                case 'closeDate':
                    aVal = new Date(a.closeDate || '2099-12-31');
                    bVal = new Date(b.closeDate || '2099-12-31');
                    break;
                default:
                    aVal = a.value || 0;
                    bVal = b.value || 0;
            }
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            }
            return aVal < bVal ? 1 : -1;
        });

        return result;
    }, [opportunities, searchTerm, filterStage, sortBy, sortOrder, selectedYear]);

    const formatCurrency = (value) => {
        if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
        return `€${value?.toLocaleString() || 0}`;
    };

    const getStageClass = (stage) => {
        const slug = stage?.toLowerCase().replace(/\s+/g, '-') || 'lead';
        return slug;
    };

    const hasActiveFilters = filterStage !== 'all' || searchTerm;

    return (
        <div className="opportunities-view">
            {/* Header Section */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">Le tue Opportunità</h2>
                    <p className="page-subtitle">
                        {filteredOpportunities.length} opportunità • Valore: €{stats.totalValue.toLocaleString()}
                    </p>
                </div>
                {/* Year Filter */}
                <select
                    className="year-filter"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    style={{ height: '44px' }}
                >
                    <option value="all">Tutti gli anni</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                </select>
            </div>

            {/* Stats Cards */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Opportunità Attive</span>
                        <div className="kpi-icon blue"><Target size={20} /></div>
                    </div>
                    <div className="kpi-value">{stats.count}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Valore Totale</span>
                        <div className="kpi-icon green"><Euro size={20} /></div>
                    </div>
                    <div className="kpi-value">{formatCurrency(stats.totalValue)}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Probabilità Media</span>
                        <div className="kpi-icon purple"><TrendingUp size={20} /></div>
                    </div>
                    <div className="kpi-value">{stats.avgProbability}%</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Valore Ponderato</span>
                        <div className="kpi-icon orange"><Euro size={20} /></div>
                    </div>
                    <div className="kpi-value">{formatCurrency(stats.weighted)}</div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="view-toolbar">
                <div className="toolbar-left">
                    <div className="search-box" style={{ flex: 1, maxWidth: '300px' }}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Cerca opportunità..."
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
                {/* Removed "Nuovo" button - using global Quick Add instead */}

            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-end',
                    flexWrap: 'wrap',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--gray-100)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)' }}>Fase</label>
                        <select
                            value={filterStage}
                            onChange={(e) => setFilterStage(e.target.value)}
                            style={{ padding: '8px 12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px', minWidth: '150px' }}
                        >
                            <option value="all">Tutte le fasi</option>
                            {pipelineStages.map(stage => (
                                <option key={stage} value={stage}>{stage}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)' }}>Ordina per</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ padding: '8px 12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px', minWidth: '150px' }}
                        >
                            <option value="value">Valore</option>
                            <option value="probability">Probabilità</option>
                            <option value="closeDate">Data Chiusura</option>
                        </select>
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={() => { setFilterStage('all'); setSearchTerm(''); }}
                            style={{ background: 'none', border: 'none', color: 'var(--gray-500)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Cancella filtri
                        </button>
                    )}
                </div>
            )}

            {/* Opportunities Cards - Tasks Style */}
            {filteredOpportunities.length === 0 ? (
                <div className="empty-state">
                    <Target size={64} strokeWidth={1} />
                    <p>{searchTerm || hasActiveFilters ? 'Nessuna opportunità trovata' : 'Nessuna opportunità ancora'}</p>
                    <button className="primary-btn" onClick={() => openAddModal('opportunity')}>
                        <Plus size={18} />
                        <span>Aggiungi la prima opportunità</span>
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredOpportunities.map(opp => {
                        const stageClass = getStageClass(opp.stage);

                        return (
                            <div
                                key={opp.id}
                                style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    padding: '20px 24px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    border: '1px solid rgba(226,232,240,0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    transition: 'all 0.25s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                                }}
                            >
                                {/* Main Content */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {/* Title & Stage Badge */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{
                                            fontSize: '16px',
                                            fontWeight: 700,
                                            color: '#0f172a'
                                        }}>
                                            {opp.title || 'Senza titolo'}
                                        </span>
                                        <span className={`stage-badge ${stageClass}`}>
                                            {opp.stage || 'Lead'}
                                        </span>
                                    </div>

                                    {/* Company & Details */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                        {opp.company && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '14px' }}>
                                                <Building2 size={16} />
                                                <span>{opp.company}</span>
                                            </div>
                                        )}

                                        {opp.closeDate && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '14px' }}>
                                                <Calendar size={16} />
                                                <span>{new Date(opp.closeDate).toLocaleDateString('it-IT')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Value */}
                                <div style={{
                                    padding: '8px 16px',
                                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    color: 'white',
                                    whiteSpace: 'nowrap'
                                }}>
                                    €{(opp.value || 0).toLocaleString()}
                                </div>

                                {/* Probability */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '100px' }}>
                                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                                        Probabilità
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '60px',
                                            height: '6px',
                                            background: '#e2e8f0',
                                            borderRadius: '6px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${opp.probability || 0}%`,
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                                                borderRadius: '6px',
                                                transition: 'width 0.3s ease'
                                            }}></div>
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                                            {opp.probability || 0}%
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => openAddModal('opportunity', opp)}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: '#f1f5f9',
                                            color: '#475569',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#6366f1';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#f1f5f9';
                                            e.currentTarget.style.color = '#475569';
                                        }}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteOpportunity(opp.id)}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: '#fef2f2',
                                            color: '#dc2626',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#dc2626';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#fef2f2';
                                            e.currentTarget.style.color = '#dc2626';
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
