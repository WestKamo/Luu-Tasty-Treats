"use client";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold">Order placed!</h1>
      <p className="mt-4 text-neutral-500">Your order <span className="font-mono text-black font-bold">{orderNumber}</span> has been received.</p>
      <Link href="/cakes" className="mt-8 inline-block text-neutral-900 underline">Back to cakes</Link>
    </div>
  );
}
