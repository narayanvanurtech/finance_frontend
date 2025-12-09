'use client';

import React from 'react';
import { LocalOffer as DealIcon, Schedule as CalendarIcon, Person as PersonIcon, CheckCircle as ActionIcon } from '@mui/icons-material';
import { styled } from '@mui/system';

const CardContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '24px',
  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr'
  }
});

const DealCard = styled('div')(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: '5px',
  padding: '20px',
  border: '1px solid #e5e7eb',
}));

const ActionCard = styled(DealCard)({
  backgroundColor: '#ffffff'
});

const Badge = styled('span')(({ color = '#3b82f6' }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 8px',
  borderRadius: '20px',
  backgroundColor: `Rs.{color}20`,
  color: color,
  fontSize: '12px',
  fontWeight: '600',
  marginBottom: '8px'
}));

const PriceTag = styled('div')({
  fontSize: '28px',
  fontWeight: '700',
  color: '#1d4ed8',
  margin: '12px 0',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '&:before': {
    content: '"Rs."',
    fontSize: '20px',
    opacity: '0.8'
  }
});

const ActionItem = styled('li')({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
  padding: '8px 0',
  borderBottom: '1px solid #f3f4f6',
  '&:last-child': {
    borderBottom: 'none'
  }
});

const contactDealsAction: React.FC = () => {
  return (
    <CardContainer>
      {/* Deals Card */}
      <DealCard className='p-6 rounded shadow-md space-y-4 border'>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <DealIcon fontSize="medium" color="primary" />
            Current Deal
          </h2>
          <Badge color="#10b981">Active</Badge>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2 text-gray-600">
            <PersonIcon fontSize="small" />
            <span className="font-medium">King</span>
          </div>
          
          <PriceTag>60,000.00</PriceTag>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CalendarIcon fontSize="small" />
            <span>Created: 11/05/2025</span>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Stage</h4>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: '45%' }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Identify Decision Makers (45%)</p>
          </div>
        </div>
      </DealCard>

      {/* Next Action Card */}
      <ActionCard className=' p-6 rounded shadow-md space-y-4 border'>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <ActionIcon fontSize="medium" color="primary" />
          Next Actions
        </h2>
        
        <ul className="space-y-3">
          <ActionItem>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">May 8</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">High Priority</span>
              </div>
              <p className="text-gray-700 mt-1">Register for upcoming CRM Webinars</p>
            </div>
          </ActionItem>
          
          <ActionItem>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">May 9</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Medium Priority</span>
              </div>
              <p className="text-gray-700 mt-1">Get Approval from Manager</p>
            </div>
          </ActionItem>
          
          <ActionItem>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">May 12</span>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Follow Up</span>
              </div>
              <p className="text-gray-700 mt-1">Send proposal to client</p>
            </div>
          </ActionItem>
        </ul>
        
      </ActionCard>
    </CardContainer>
  );
};

export default contactDealsAction;