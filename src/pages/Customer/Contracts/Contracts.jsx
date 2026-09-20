import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileCheck2,
  Calendar,
  Lock,
  Download,
  Eye,
  Building,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../../context/AuthContext';
// from '../../../supabaseClient'; // 🚀 SUPABASE IMPORT
import RentalStatusBadge from '../../../components/CustomerLayout/RentalStatusBadge';
import './Contracts.css';

export default function Contracts() {
  const { user } = useAuth();
  const [contractsData, setContractsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveContracts();
  }, []);

  const fetchLiveContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedContracts = data.map((r, index) => {
        const orderIdShort = 'REN-' + r.id.substring(0, 6).toUpperCase();
        return {
          id: r.id,
          contractNumber: `AGR-2026-${501 + index}`,
          orderId: orderIdShort,
          productName: r.products?.title || 'Rentora Equipment',
          vendorName: r.products?.vendor?.name || 'Rentora Verified Hub',
          startDate: r.start_date,
          endDate: r.end_date,
          signDate: new Date(r.created_at || Date.now()).toISOString().split('T')[0],
          depositEscrowStatus: `₹${r.security_deposit?.toLocaleString('en-IN')} Secured in Escrow`,
          damageCoverage: 'Comprehensive Rentora Protect (₹50k limit)',
          status: 'Active'
        };
      });

      setContractsData(mappedContracts);
    } catch (err) {
      console.error('Failed to fetch live contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  // 📜 Printable Legal Agreement Window
  const openContractPrintWindow = (contract) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rental Agreement - ${contract.contractNumber}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 50px; color: #1c1917; background: #fff; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #4A5D23; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #4A5D23; letter-spacing: 1px; }
            .title { font-size: 20px; font-weight: bold; margin-top: 10px; text-transform: uppercase; }
            .section { margin-bottom: 25px; }
            .section h3 { font-size: 16px; color: #292524; border-bottom: 1px solid #d6d3d1; padding-bottom: 5px; margin-bottom: 10px; font-family: sans-serif; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px; font-family: sans-serif; background: #f5f5f4; padding: 15px; border-radius: 6px; }
            .terms { font-size: 13px; text-align: justify; color: #44403c; }
            .signatures { display: flex; justify-content: space-between; margin-top: 60px; font-family: sans-serif; font-size: 14px; }
            .sig-box { border-top: 1px solid #78716c; width: 200px; text-align: center; padding-top: 5px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">RENTORA PLATFORM ESCROW</div>
            <div class="title">Master Equipment Rental & Escrow Agreement</div>
            <p style="font-size: 12px; color: #78716c; font-family: sans-serif;">Legally Binding Contract under Indian Contract Act, 1872</p>
          </div>

          <div class="section">
            <h3>1. Contract & Order Overview</h3>
            <div class="grid">
              <div><strong>Agreement ID:</strong> ${contract.contractNumber}</div>
              <div><strong>Linked Order Ref:</strong> ${contract.orderId}</div>
              <div><strong>Equipment:</strong> ${contract.productName}</div>
              <div><strong>Vendor Partner:</strong> ${contract.vendorName}</div>
              <div><strong>Rental Period:</strong> ${contract.startDate} to ${contract.endDate}</div>
              <div><strong>Execution Date:</strong> ${contract.signDate}</div>
            </div>
          </div>

          <div class="section">
            <h3>2. Escrow & Penalty Clauses</h3>
            <div class="terms">
              <p>• <strong>Security Deposit Custody:</strong> The refundable security deposit has been securely deposited into the Rentora Escrow smart contract vault and will be returned upon successful verification of equipment return.</p>
              <p>• <strong>Late Return Penalty:</strong> Failure to return the equipment by the specified end date will incur an automatic penalty of ₹500 per day, deducted directly from the escrow security deposit.</p>
              <p>• <strong>Damage Liability:</strong> The renter assumes full physical custody liability during the rental duration, backed by Rentora Protect coverage.</p>
            </div>
          </div>

          <div class="signatures">
            <div class="sig-box">
              <strong>Vansh Patel</strong><br/>Renter Signature
            </div>
            <div class="sig-box">
              <strong>${contract.vendorName}</strong><br/>Verified Vendor Hub
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return <div className="p-8 text-center text-[#78716C] font-bold">Loading live contracts...</div>;
  }

  return (
    <div className="contracts-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Rental Contracts & Agreements</h1>
          <p className="page-sub-heading">
            Legally binding rental agreements, equipment protection policies, and digital signature records.
          </p>
        </div>
      </div>

      {/* Escrow & Legal Protection Banner */}
      <div className="legal-protection-banner">
        <div className="banner-icon-box">
          <ShieldCheck size={32} className="text-emerald-500" />
        </div>
        <div className="banner-content">
          <h4>Rentora Master Rental Agreement Framework</h4>
          <p>
            All rental transactions are governed by standard Indian contract terms, transparent handover logs, and secure escrow holding of all refundable deposits.
          </p>
        </div>
      </div>

      {/* Contracts List */}
      <div className="contracts-grid">
        {contractsData.length === 0 ? (
          <div className="text-center py-12 text-slate-400 col-span-2">
            No active rental contracts found. Place an order to generate legal agreements.
          </div>
        ) : (
          contractsData.map((contract) => (
            <div key={contract.id} className="contract-card">
              <div className="contract-card-header">
                <div>
                  <span className="contract-num">{contract.contractNumber}</span>
                  <div className="contract-order-ref">Linked Order: <strong>{contract.orderId}</strong></div>
                </div>
                <RentalStatusBadge status={contract.status} />
              </div>

              <div className="contract-card-body">
                <h3 className="contract-product-title">{contract.productName}</h3>

                <div className="contract-meta-list">
                  <div className="contract-meta-item">
                    <Building size={15} className="text-slate-400" />
                    <span>Vendor Partner: <strong>{contract.vendorName}</strong></span>
                  </div>
                  <div className="contract-meta-item">
                    <Calendar size={15} className="text-primary-red" />
                    <span>Rental Period: <strong>{contract.startDate} &rarr; {contract.endDate}</strong></span>
                  </div>
                  <div className="contract-meta-item">
                    <FileCheck2 size={15} className="text-charcoal-light" />
                    <span>Signed on: <strong>{contract.signDate}</strong></span>
                  </div>
                </div>

                {/* Coverage & Escrow Pill Box */}
                <div className="contract-terms-box">
                  <div className="term-row">
                    <span className="term-lbl">Deposit Escrow:</span>
                    <span className="term-val font-semibold text-emerald-600">{contract.depositEscrowStatus}</span>
                  </div>
                  <div className="term-row">
                    <span className="term-lbl">Insurance Coverage:</span>
                    <span className="term-val text-charcoal">{contract.damageCoverage}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="contract-card-footer">
                <button
                  onClick={() => openContractPrintWindow(contract)}
                  className="btn-view-contract"
                >
                  <Eye size={15} />
                  <span>View & Print Full Agreement</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}