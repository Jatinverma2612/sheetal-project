import React from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { deleteAddress } from "../../services/userService";
import { CircleCheckBig } from "lucide-react";

// Define based on backend schema
export interface Address {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  addressType: "Home" | "Office" | "Other";
}

interface AddressListProps {
  addresses: Address[];
  selectedShippingAddressId: string | null;
  selectedBillingAddressId: string | null;
  billingSameAsShipping: boolean;
  onSelectAddress?: (id: string) => void;
  onSelectShippingAddress: (id: string) => void;
  onSelectBillingAddress: (id: string) => void;
  onToggleBillingSameAsShipping: (sameAsShipping: boolean) => void;
  onRefresh: () => void;
  onAddNew: () => void;
  onEdit: (address: Address) => void;
}

const   AddressList: React.FC<AddressListProps> = ({
  addresses,
  selectedShippingAddressId,
  selectedBillingAddressId,
  billingSameAsShipping,
  onSelectAddress,
  onSelectShippingAddress,
  onSelectBillingAddress,
  onToggleBillingSameAsShipping,
  onRefresh,
  onAddNew,
  onEdit,
}) => {
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await deleteAddress(id);
      if (response.success) {
        toast.success("Address deleted.");
        onRefresh();
      } else {
        toast.error(response.message || "Failed to delete.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred.");
    }
  };

  const selectShippingAddress =
    onSelectShippingAddress || onSelectAddress || (() => {});
  const selectBillingAddress =
    onSelectBillingAddress || onSelectAddress || (() => {});

  const renderAddressCard = (
    addr: Address,
    isSelected: boolean,
    onSelect: (id: string) => void,
    cardKey: string,
    actionLabel: string,
  ) => (
    <div
      key={cardKey}
      className={`border p-4 rounded relative cursor-pointer transition-colors ${isSelected ? "border-[#bd9951] bg-[#fffcf5]" : "border-gray-200 hover:border-gray-300"}`}
      onClick={() => onSelect(addr._id)}
    >
      <div className="mb-2">
        {addr.isDefault && (
          <span className="bg-[#956a2c] text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider inline-block mb-2">
            Default
          </span>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-gray-800">
            {addr.firstName} {addr.lastName}
          </span>
          <span className="text-xs text-[#956a2c] uppercase border border-[#956a2c] px-1.5 py-0.5 rounded tracking-wide">
            {addr.addressType}
          </span>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-3 leading-relaxed">
        {addr.addressLine1} <br />
        {addr.city}, {addr.state}, {addr.country} - {addr.postalCode} <br />
        Phone: {addr.phoneNumber}
      </div>

      {isSelected && (
        <button className="w-full cursor-pointer bg-[#bd9951] text-white text-xs font-bold py-2 rounded mb-3">
          {actionLabel}
        </button>
      )}
      {isSelected && (
        <div className="absolute -top-1 -right-1 bg-white">
          <Image
            src="/assets/tick-green.png"
            alt=""
            width={20}
            height={20}
            className="h-5 w-5"
          />
        </div>
      )}

      <div className="flex gap-10 mt-2 pt-2 border-t border-gray-100 text-sm">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(addr);
          }}
          className="cursor-pointer flex-1 py-1 px-2 border rounded-full border-gray-400  text-center hover:bg-gray-50 text-gray-600"
        >
          Edit
        </button>
        <button
          onClick={(e) => handleDelete(e, addr._id)}
          className="cursor-pointer flex-1 py-1 px-2 border border-gray-400 rounded-full text-center hover:text-red-500 hover:border-red-200 text-gray-600"
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4 border-b border-gray-300 pb-2">
        <h4 className="text-lg sm:text-xl text-[#785e32] font-montserrat">
          Select Address
        </h4>
        <button
          onClick={onAddNew}
          className="border border-black cursor-pointer text-black text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 hover:bg-gray-50 transition-colors uppercase tracking-wide w-full sm:w-auto"
        >
          Add New Address
        </button>
      </div>

      <div className="mb-2">
        <p className="font-semibold text-gray-700">Select a delivery address</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {addresses.map((addr) =>
          renderAddressCard(
            addr,
            selectedShippingAddressId === addr._id,
            selectShippingAddress,
            addr._id,
            "DELIVER TO THIS ADDRESS",
          ),
        )}
      </div>

      <div className="mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <p className="font-semibold text-gray-700">
            Select a billing address
          </p>
          <label className="flex items-center gap-2 cursor-pointer flex-wrap">
            <input
              type="checkbox"
              checked={billingSameAsShipping}
              onChange={(e) => onToggleBillingSameAsShipping(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <span className="text-sm text-gray-600">Same as above address</span>
          </label>
        </div>

        {!billingSameAsShipping && (
          <div
            id="billing-address-grid"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
          >
            {addresses.map((addr) =>
              renderAddressCard(
                addr,
                selectedBillingAddressId === addr._id,
                selectBillingAddress,
                `billing-${addr._id}`,
                "BILL THIS ADDRESS",
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressList;
