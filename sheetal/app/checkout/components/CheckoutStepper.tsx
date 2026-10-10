import React from "react";
import Link from "next/link";

interface CheckoutStepperProps {
  currentStep: "bag" | "address" | "payment";
}

const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ currentStep }) => {
  const steps = [
    { key: "bag", label: "Bag", link: "/cart" },
    { key: "address", label: "Address", link: "/checkout/address" },
    { key: "payment", label: "Payment", link: "/checkout/payment" },
  ];

  return (
    <div className="cart-process mb-8 border-b border-gray-200 pb-4">
      <div className="flex flex-col md:flex-row justify-between items-center">
        {/* Steps List */}
        <ul className="flex space-x-8 text-sm uppercase tracking-wide font-medium text-gray-400">
          {steps.map((step, index) => (
            <li
              key={step.key}
              className={`${
                currentStep === step.key
                  ? "text-black font-bold border-b-2 border-black pb-1"
                  : ""
              }`}
            >
              <Link href={step.link}>{step.label}</Link>
            </li>
          ))}
        </ul>

        {/* Current Step Indicator (Desktop) */}
        <div className="hidden md:flex items-center text-sm text-gray-500 mt-2 md:mt-0">
          <Link
            href="/cart"
            className="flex items-center text-[#bd9951] mr-2 hover:underline"
          >
            <span className="mr-1">←</span> Back
          </Link>
          <span>
            Step {steps.findIndex((s) => s.key === currentStep) + 1} of 3
          </span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutStepper;
