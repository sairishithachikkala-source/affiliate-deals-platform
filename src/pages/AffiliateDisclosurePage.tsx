import React from 'react';
import { ShieldCheck, Info, ExternalLink } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const AffiliateDisclosurePage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="container" style={{ padding: '3rem 1rem 5rem', maxWidth: '800px' }}>
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '2.5rem 2rem',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
        }}
        className="animate-fade-in"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            {t('footer_affiliate_disclosure')}
          </h1>
        </div>

        <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          At <strong>DealNest India</strong>, we believe in complete honesty and transparency with our users. This disclosure page explains our affiliate relationships and how we earn revenue to keep this platform 100% free for Indian shoppers.
        </p>

        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '2rem',
            color: '#1e40af',
            fontSize: '0.9rem',
            lineHeight: 1.5,
          }}
        >
          <strong>Summary for Consumers:</strong> When you click on a deal link on DealNest India and make a purchase on a retailer’s website (such as Amazon India or Flipkart), we may earn a small referral commission at <strong>NO extra cost to you</strong>.
        </div>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            1. Amazon Associates Disclosure
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
            DealNest India is a participant in the Amazon Services LLC Associates Program and the Amazon India Associates Program, an affiliate advertising program designed to provide a means for websites to earn advertising fees by advertising and linking to Amazon.in.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            2. Flipkart & Other Retailer Affiliates
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
            We also participate in affiliate marketing programs with Flipkart Internet Private Limited, Myntra, Tata CLiQ, Croma, and other reputable Indian e-commerce merchants. Links to these sites contain unique referral identifiers that attribute purchases to DealNest India.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            3. Editorial Independence & Pricing
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
            Our editorial selection of deals is governed by genuine value for Indian consumers, verified price drops, and product ratings. We do not accept payment to feature inferior products. Product prices and availability change rapidly on retailer websites; all prices displayed are verified at the time of publication but are subject to change by the respective retailers.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            4. Indian Regulatory Compliance
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
            This disclosure complies with the Advertising Standards Council of India (ASCI) Guidelines for Influencer and Affiliate Advertising in Digital Media, as well as the Consumer Protection (E-Commerce) Rules, 2020.
          </p>
        </section>
      </div>
    </div>
  );
};
