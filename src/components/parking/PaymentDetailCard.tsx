import Card from '../ui/Card';
import { PaymentDetails } from '@/types/parking';

interface PaymentDetailCardProps {
  payment: PaymentDetails;
}

export default function PaymentDetailCard({ payment }: PaymentDetailCardProps) {
  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 className="text-base font-semibold text-black">Payment Detail</h2>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <p className="text-sm text-gray-700">Parking Fee</p>
          <p className="text-sm font-medium text-black">{payment.parkingFee.toFixed(2)} ETB</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm text-gray-700">VAT(15%)</p>
          <p className="text-sm font-medium text-black">{payment.vat.toFixed(2)} ETB</p>
        </div>
        <div className="mt-3 flex justify-between border-t border-gray-200 pt-2">
          <p className="text-base font-bold text-black">Total</p>
          <p className="text-base font-bold text-black">{payment.total.toFixed(2)} ETB</p>
        </div>
      </div>
    </Card>
  );
}
