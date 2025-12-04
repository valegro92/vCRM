import React, { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Line, ReferenceLine, ComposedChart, Area
} from 'recharts';
import { MONTHLY_TARGETS, ANNUAL_TARGET } from '../constants/targets';

export default function Dashboard({ opportunities, tasks, contacts, invoices = [], setActiveView }) {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const currentMonth = new Date().getMonth();

    // === DATI PER GRAFICI BI ===
    const biData = useMemo(() => {
        const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

        // Pipeline attiva (non chiusa)
        const activeOffers = opportunities.filter(o =>
            !o.stage?.toLowerCase().includes('chiuso')
        );

        // Probabilità per stage
        const stageProbability = {
            'Lead': 0.1,
            'In contatto': 0.2,
            'Follow Up da fare': 0.4,
            'Revisionare offerta': 0.6
        };

        // Pipeline ponderata totale
        const weightedPipeline = activeOffers.reduce((sum, o) => {
            const prob = stageProbability[o.stage] || 0.3;
            return sum + ((parseFloat(o.value) || 0) * prob);
        }, 0);

        // Mesi rimanenti nell'anno
        const remainingMonths = 12 - currentMonth - 1;
        const pipelinePerMonth = remainingMonths > 0 ? weightedPipeline / remainingMonths : 0;

        // Genera dati per ogni mese
        const monthlyData = months.map((monthName, index) => {
            const target = MONTHLY_TARGETS[index]?.target || 0;

            // Ordinato (venduto) del mese
            const ordinato = opportunities
                .filter(o => {
                    if (!o.closeDate) return false;
                    const d = new Date(o.closeDate);
                    return d.getMonth() === index &&
                        d.getFullYear() === selectedYear &&
                        (o.stage === 'Chiuso Vinto' || o.originalStage === 'Chiuso Vinto');
                })
                .reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);

            // Fatturato del mese
            const fatturato = invoices
                .filter(i => {
                    const dateStr = i.issueDate || i.date;
                    if (!dateStr) return false;
                    const d = new Date(dateStr);
                    return d.getMonth() === index &&
                        d.getFullYear() === selectedYear &&
                        i.status !== 'Bozza' && i.status !== 'Annullata';
                })
                .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

            // Backlog = Ordinato - Fatturato (solo se positivo)
            const backlog = Math.max(0, ordinato - fatturato);

            // Forecast (per mesi futuri)
            const isFuture = index > currentMonth;
            const forecast = isFuture ? pipelinePerMonth : null;

            return {
                month: monthName,
                monthIndex: index,
                target,
                ordinato,
                fatturato,
                backlog,
                forecast,
                isFuture,
                isPast: index < currentMonth,
                isCurrent: index === currentMonth
            };
        });

        // Calcoli cumulativi per forecast
        let cumulativeOrdinato = 0;
        let cumulativeFatturato = 0;
        let cumulativeForecast = 0;

        const cumulativeData = monthlyData.map((m, index) => {
            if (m.isFuture) {
                cumulativeForecast += m.forecast || 0;
            } else {
                cumulativeOrdinato += m.ordinato;
                cumulativeFatturato += m.fatturato;
            }

            // Target cumulativo
            const cumulativeTarget = MONTHLY_TARGETS
                .slice(0, index + 1)
                .reduce((sum, t) => sum + t.target, 0);

            return {
                ...m,
                cumulativeOrdinato,
                cumulativeFatturato,
                cumulativeTarget,
                cumulativeForecast: m.isFuture ? cumulativeOrdinato + cumulativeForecast : null
            };
        });

        // KPI Summary
        const ytdOrdinato = cumulativeData[currentMonth]?.cumulativeOrdinato || 0;
        const ytdFatturato = cumulativeData[currentMonth]?.cumulativeFatturato || 0;
        const ytdTarget = cumulativeData[currentMonth]?.cumulativeTarget || 0;
        const ytdBacklog = ytdOrdinato - ytdFatturato;
        const projectedTotal = ytdOrdinato + weightedPipeline;

        return {
            monthlyData,
            cumulativeData,
            ytdOrdinato,
            ytdFatturato,
            ytdTarget,
            ytdBacklog,
            weightedPipeline,
            projectedTotal
        };
    }, [opportunities, invoices, selectedYear, currentMonth]);

    const formatCurrency = (value) => {
        if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `€${Math.round(value / 1000)}K`;
        return `€${Math.round(value)}`;
    };

    const formatTooltip = (value) => `€${value.toLocaleString('it-IT')}`;

    // Colori
    const colors = {
        target: '#94a3b8',
        ordinato: '#3b82f6',
        fatturato: '#10b981',
        backlog: '#f59e0b',
        forecast: '#8b5cf6',
        danger: '#ef4444'
    };

    return (
        <div className="dashboard bi-dashboard">
            {/* Header con KPI Summary */}
            <div className="bi-header">
                <div className="bi-header-left">
                    <h1>📊 Business Intelligence</h1>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="year-selector"
                    >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>
                <div className="bi-kpi-row">
                    <div className="bi-kpi">
                        <span className="bi-kpi-label">Ordinato YTD</span>
                        <span className="bi-kpi-value">{formatCurrency(biData.ytdOrdinato)}</span>
                        <span className={`bi-kpi-delta ${biData.ytdOrdinato >= biData.ytdTarget ? 'positive' : 'negative'}`}>
                            {biData.ytdOrdinato >= biData.ytdTarget ? '↑' : '↓'} {formatCurrency(Math.abs(biData.ytdOrdinato - biData.ytdTarget))} vs target
                        </span>
                    </div>
                    <div className="bi-kpi">
                        <span className="bi-kpi-label">Fatturato YTD</span>
                        <span className="bi-kpi-value">{formatCurrency(biData.ytdFatturato)}</span>
                        <span className="bi-kpi-delta neutral">
                            {formatCurrency(biData.ytdBacklog)} da fatturare
                        </span>
                    </div>
                    <div className="bi-kpi">
                        <span className="bi-kpi-label">Proiezione Anno</span>
                        <span className="bi-kpi-value">{formatCurrency(biData.projectedTotal)}</span>
                        <span className={`bi-kpi-delta ${biData.projectedTotal >= ANNUAL_TARGET ? 'positive' : 'negative'}`}>
                            {biData.projectedTotal >= ANNUAL_TARGET ? '✓' : '⚠'} Target {formatCurrency(ANNUAL_TARGET)}
                        </span>
                    </div>
                </div>
            </div>

            {/* GRAFICO 1: Ordinato vs Target */}
            <div className="bi-chart-card">
                <div className="bi-chart-header">
                    <div>
                        <h3>📈 Ordinato vs Target Mensile</h3>
                        <p>Confronto venduto vs obiettivo per ogni mese</p>
                    </div>
                    <div className="bi-legend">
                        <span><span className="dot" style={{ background: colors.target }}></span> Target</span>
                        <span><span className="dot" style={{ background: colors.ordinato }}></span> Ordinato</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={biData.monthlyData} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={formatCurrency} />
                        <Tooltip formatter={formatTooltip} />
                        <Bar dataKey="target" fill={colors.target} radius={[4, 4, 0, 0]} name="Target" />
                        <Bar dataKey="ordinato" fill={colors.ordinato} radius={[4, 4, 0, 0]} name="Ordinato" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* GRAFICO 2: Fatturato vs Backlog */}
            <div className="bi-chart-card">
                <div className="bi-chart-header">
                    <div>
                        <h3>💰 Fatturato vs Da Fatturare</h3>
                        <p>Quanto hai incassato e quanto ti resta in pancia</p>
                    </div>
                    <div className="bi-legend">
                        <span><span className="dot" style={{ background: colors.fatturato }}></span> Fatturato</span>
                        <span><span className="dot" style={{ background: colors.backlog }}></span> Da Fatturare</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={biData.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={formatCurrency} />
                        <Tooltip formatter={formatTooltip} />
                        <Bar dataKey="fatturato" stackId="stack" fill={colors.fatturato} name="Fatturato" />
                        <Bar dataKey="backlog" stackId="stack" fill={colors.backlog} radius={[4, 4, 0, 0]} name="Da Fatturare" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* GRAFICO 3: Forecast Cumulativo */}
            <div className="bi-chart-card">
                <div className="bi-chart-header">
                    <div>
                        <h3>🔮 Forecast Annuale</h3>
                        <p>Andamento cumulativo + proiezione da pipeline</p>
                    </div>
                    <div className="bi-legend">
                        <span><span className="dot" style={{ background: colors.ordinato }}></span> Ordinato</span>
                        <span><span className="dot" style={{ background: colors.fatturato }}></span> Fatturato</span>
                        <span><span className="dot" style={{ background: colors.forecast }}></span> Proiezione</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={biData.cumulativeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={formatCurrency} />
                        <Tooltip formatter={formatTooltip} />
                        <ReferenceLine y={ANNUAL_TARGET} stroke={colors.danger} strokeDasharray="5 5" label={{ value: `Target €85K`, position: 'right', fill: colors.danger, fontSize: 12 }} />
                        <Area type="monotone" dataKey="cumulativeOrdinato" fill={colors.ordinato} fillOpacity={0.2} stroke={colors.ordinato} strokeWidth={2} name="Ordinato Cumulativo" />
                        <Line type="monotone" dataKey="cumulativeFatturato" stroke={colors.fatturato} strokeWidth={3} dot={{ r: 4 }} name="Fatturato Cumulativo" />
                        <Line type="monotone" dataKey="cumulativeForecast" stroke={colors.forecast} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Proiezione Pipeline" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

