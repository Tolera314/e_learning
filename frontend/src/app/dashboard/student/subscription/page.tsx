'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, GraduationCap, School, BookOpen, Globe, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

const PricingPage = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  const plans = [
    {
      id: 'KG_G5',
      name: 'Primary (KG - G5)',
      icon: <BookOpen className="w-8 h-8 text-blue-500" />,
      monthlyPrice: 100,
      yearlyPrice: 100 * 12 * 0.95,
      features: [
        'Full access to KG-G5 content',
        'Interactive quizzes',
        'Digital certificates',
        'Teacher support',
        'Offline viewing'
      ],
      color: 'blue'
    },
    {
      id: 'G6_G12',
      name: 'Secondary (G6 - G12)',
      icon: <School className="w-8 h-8 text-purple-500" />,
      monthlyPrice: 200,
      yearlyPrice: 200 * 12 * 0.95,
      features: [
        'All G6-G12 curriculum',
        'Advanced labs',
        'College prep materials',
        'Live group sessions',
        'Priority support'
      ],
      color: 'purple',
      popular: true
    },
    {
      id: 'UNIVERSITY',
      name: 'Higher Ed (University)',
      icon: <GraduationCap className="w-8 h-8 text-amber-500" />,
      monthlyPrice: 300,
      yearlyPrice: 300 * 12 * 0.95,
      features: [
        'Specialized degree courses',
        'Industry certifications',
        'Expert-led live classes',
        'Mentorship program',
        'Portfolio building'
      ],
      color: 'amber'
    }
  ];

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    try {
      const response = await api.post('/payments/checkout', {
        segment: planId,
        interval: billingCycle
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      toast.error('Failed to initiate checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-slate-900 sm:text-5xl"
          >
            Invest in Your Future
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-xl text-slate-600"
          >
            Access premium education tailored for Ethiopia. Start with a 3-day free trial.
          </motion.p>
          
          <div className="mt-8 flex justify-center">
            <div className="relative bg-white rounded-full p-1 shadow-sm border border-slate-200">
              <button
                onClick={() => setBillingCycle('MONTHLY')}
                className={`relative px-6 py-2 text-sm font-medium rounded-full transition-all ${
                  billingCycle === 'MONTHLY' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('YEARLY')}
                className={`relative px-6 py-2 text-sm font-medium rounded-full transition-all ${
                  billingCycle === 'YEARLY' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Yearly (5% Off)
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-3xl p-8 shadow-xl border-2 transition-transform hover:scale-105 ${
                plan.popular ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-100'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
              )}
              
              <div className="flex items-center justify-between mb-8">
                <div className={`p-3 rounded-2xl bg-blue-50`}>
                  {plan.icon}
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-slate-900">
                    ETB {billingCycle === 'MONTHLY' ? plan.monthlyPrice : Math.round(plan.yearlyPrice)}
                  </span>
                  <span className="text-slate-500 block text-sm">
                    per {billingCycle === 'MONTHLY' ? 'month' : 'year'}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-6">{plan.name}</h3>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className={`w-5 h-5 mr-3 text-emerald-500 flex-shrink-0 mt-0.5`} />
                    <span className="text-slate-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-4 px-6 rounded-2xl font-bold transition-all flex items-center justify-center ${
                  plan.popular 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30' 
                  : 'bg-slate-900 text-white hover:bg-slate-800'
                } disabled:opacity-50`}
              >
                {loading === plan.id ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Get Started
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4 text-left">
            <div className="bg-emerald-100 p-3 rounded-full">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">100% Secure Checkout</h4>
              <p className="text-slate-600 text-sm">Encrypted transactions processed by Stripe.</p>
            </div>
          </div>
          <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
            <Globe className="w-8 h-8" />
            <div className="text-sm font-bold text-slate-400 self-center uppercase tracking-widest">
              Available Nationwide
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
