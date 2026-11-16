"use client";

import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getOrderById } from "../../services/orderService";
import { getBasicInfo } from "../../services/basicInfoService";
import { getSettings } from "../../services/settingsService";
import { logout } from "../../services/authService";
import Cookies from "js-cookie";
import HideStorefrontHeader from "../../components/HideStorefrontHeader";

import { useSettings } from "../../hooks/useSettings";
import { getLogoUrl } from "../../services/settingsService";

type OrderStatus =
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Returned"
  | "Exchanged";

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    gstPercent?: number;
    category?: {
      name?: string;
      hsnCode?: string;
      gstPercent?: number;
    } | null;
  } | null;
  name: string;
  image: string;
  price: number;
  quantity: number;
  gstPercent?: number;
  variant?: { size?: string; color?: string; v_sku?: string };
}

interface Order {
  _id: string;
  user: {
    _id: string;
    name?: string;
    email: string;
  };
  orderItems: OrderItem[];
  orderStatus: OrderStatus;
  totalPrice: number;
  itemsPrice: number;
  discountPrice: number;
  shippingPrice: number;
  taxPrice: number;
  paymentInfo: {
    id?: string;
    status?: string;
    method: "COD" | "Online";
    displayMethod?: string;
  };
  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface BasicInfoAddress {
  addressLine: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
}

interface BasicInfo {
  gstNumber: string;
  companyName: string;
  invoiceDeclaration: string;
  invoiceContactText: string;
  invoiceFooterYear: string;
  shippingAddress: BasicInfoAddress;
  billingAddress: BasicInfoAddress;
}

const INVOICE_ORDER_ID_KEY = "checkout_invoice_order_id";
const emptyAddress: BasicInfoAddress = {
  addressLine: "",
  pincode: "",
  city: "",
  state: "",
  country: "",
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const shortId = (id: string) => id.slice(-10).toUpperCase();

const formatPaymentMode = (paymentInfo?: Order["paymentInfo"] | null) => {
  if (paymentInfo?.displayMethod?.trim()) {
    return paymentInfo.displayMethod.trim();
  }

  return paymentInfo?.method === "COD" ? "Cash on Delivery" : "Online";
};

const formatAddressLines = (address: BasicInfoAddress) => {
  const lines = [
    address.addressLine,
    [address.city, address.state].filter(Boolean).join(", "),
    [address.pincode, address.country].filter(Boolean).join(" "),
  ].filter(Boolean);

  return lines.length > 0 ? lines : ["Not configured"];
};

const InvoicePageInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    gstNumber: "",
    companyName: "",
    invoiceDeclaration: "",
    invoiceContactText: "",
    invoiceFooterYear: "",
    shippingAddress: emptyAddress,
    billingAddress: emptyAddress,
  });
  const [globalTax, setGlobalTax] = useState(0);
  const [globalHsnCode, setGlobalHsnCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState(
    searchParams.get("orderId") || searchParams.get("order_id") || "",
  );

    const { settings } = useSettings();
    const logoUrl = getLogoUrl(settings);
    const autoPrint = searchParams.get("auto") === "true";

  useEffect(() => {
    if (!loading && order && !error && autoPrint) {
      const timer = setTimeout(() => {
        try {
          window.print();
        } catch {
          // Ignore automatic print suppression
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [loading, order, error, autoPrint]);

  useEffect(() => {
    const storedOrderId = sessionStorage.getItem(INVOICE_ORDER_ID_KEY);
    const nextOrderId = orderId || storedOrderId || "";

    if (!orderId && storedOrderId) {
      setOrderId(storedOrderId);
    }

    if (nextOrderId) {
      sessionStorage.setItem(INVOICE_ORDER_ID_KEY, nextOrderId);
    }
  }, [orderId]);

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem("token") || Cookies.get("token");
      if (!token) {
        router.replace(`/login?redirect=/checkout/download-invoice?orderId=${orderId}`);
        return;
      }

      if (!orderId) {
        setError("No order was found for this invoice.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const [orderRes, basicInfoRes, settingsRes] = await Promise.allSettled([
          getOrderById(orderId),
          getBasicInfo(),
          getSettings(),
        ]);

        if (orderRes.status === "fulfilled") {
          const res = orderRes.value;
          if (res?.success && res?.data) {
            setOrder(res.data as Order);
          } else {
            // Check if error is due to auth (token expired or invalid)
            if (res?.message?.toLowerCase().includes("token") || res?.message?.toLowerCase().includes("unauthorized") || res?.message?.toLowerCase().includes("not authorized")) {
              logout();
              router.replace(`/login?redirect=/checkout/download-invoice?orderId=${orderId}`);
              return;
            }
            setError(res?.message || "Unable to load this invoice.");
          }
        } else {
          setError("Unable to load this invoice right now.");
        }

        if (basicInfoRes.status === "fulfilled") {
          const res = basicInfoRes.value;
          if (res?.success && res?.data) {
            setBasicInfo({
              gstNumber: res.data.gstNumber || "",
              companyName: res.data.companyName || "",
              invoiceDeclaration: res.data.invoiceDeclaration || "",
              invoiceContactText: res.data.invoiceContactText || "",
              invoiceFooterYear: res.data.invoiceFooterYear || "",
              shippingAddress: res.data.shippingAddress || emptyAddress,
              billingAddress: res.data.billingAddress || emptyAddress,
            });
          }
        }

        if (settingsRes.status === "fulfilled") {
          setGlobalTax(settingsRes.value.taxPercentage || 0);
          setGlobalHsnCode(settingsRes.value.globalHsnCode || "");
        }
      } catch {
        setError("Unable to load this invoice right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded shadow-md text-center max-w-md w-full">
          <div className="w-12 h-12 border-4 border-[#bd9951] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded shadow-md text-center max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 mb-2">
            Invoice unavailable
          </h1>
          <p className="text-gray-600 mb-4 text-sm">
            {error || "We couldn't find the order for this invoice."}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.back()}
              className="block w-full bg-black text-white py-3 rounded font-semibold hover:bg-gray-800 transition"
            >
              Go Back
            </button>
            <Link
              href="/my-account/orders"
              className="block w-full border border-gray-300 text-gray-700 py-3 rounded font-semibold hover:bg-gray-50 transition"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const invoiceDate = fmtDate(order.createdAt);
  const orderDate = fmtDate(order.createdAt);
  const invoiceNumber = `I${shortId(order._id)}`;
  const paymentMode = formatPaymentMode(order.paymentInfo);
  const shippingAddress = order.shippingAddress || ({} as Order["shippingAddress"]);
  const shippingAddressLines = [
    shippingAddress.addressLine1,
    [shippingAddress.city, shippingAddress.state].filter(Boolean).join(", "),
    [shippingAddress.postalCode, shippingAddress.country].filter(Boolean).join(" "),
  ].filter(Boolean);
  const billingAddressLines = formatAddressLines(basicInfo.billingAddress);
  const shippingOfficeLines = formatAddressLines(basicInfo.shippingAddress);

  const handleDownloadHtmlInvoice = () => {
    const invoiceEl = document.getElementById("tax-invoice-printable");
    if (!invoiceEl) {
      window.print();
      return;
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${order?._id || orderId}</title>
  <style>
    * { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; }
    body { margin: 24px; padding: 0; background: #fff; color: #111; }
    table { width: 100%; border-collapse: collapse; }
    @media print { .no-print { display: none !important; } }
  </style>
</head>
<body>
  ${invoiceEl.outerHTML}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice_${invoiceNumber || orderId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <HideStorefrontHeader />
      <style>{`
        * { font-family: var(--font-montserrat), sans-serif; }
        @media print { .no-print { display: none !important; } }
      `}</style>

      <div className="no-print mx-5 mt-4 mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg bg-gray-100 p-4 border border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Order Invoice</h2>
          <p className="text-xs text-gray-500">Order ID: #{order?._id || orderId}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-md bg-[#bd9951] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#a8843f] transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / Save as PDF
          </button>
          <button
            onClick={handleDownloadHtmlInvoice}
            className="flex items-center gap-2 rounded-md border border-[#bd9951] bg-white px-4 py-2.5 text-sm font-semibold text-[#8d6b2f] shadow-sm hover:bg-[#fcf8f1] transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Invoice (.html)
          </button>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>

      <div id="tax-invoice-printable" className="m-5 bg-white">
        <div className="w-full border border-[#01008b47]">
          <div className="px-[30px] pt-[36px] pb-[42px]">
            <table className="w-full border-collapse mb-0">
              <tbody>
                <tr>
                  <td className="align-top p-0 flex justify-center text-[#153643] w-25 h-25">
                    <Link href={"/"}>
                      <Image
                        src={logoUrl || "/assets/icons/icon-1.png"}
                        alt="Studio By Sheetal"
                        width={140}
                        height={100}
                        className="block h-full w-auto"
                      />
                    </Link>
                  </td>
                  <td className="align-top text-right text-[#153643]">
                    <h1 className="text-[32px] font-bold my-5">
                      {basicInfo.companyName || "Sheetal By Studios"}
                    </h1>
                    <p className="text-[16px]">
                      <strong>GSTIN Number:</strong>{" "}
                      {basicInfo.gstNumber || "Not configured"}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="pb-9 text-center text-[#153643]">
                    <h1 className="text-[32px] font-bold my-5">Tax Invoice</h1>
                  </td>
                </tr>
              </tbody>
            </table>

            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="pb-[36px] text-[#153643]">
                    <table className="w-full border-collapse bg-white mb-0">
                      <tbody>
                        <tr>
                          <td className="p-0">
                            <p className="text-[16px] text-[#111111] m-0 mb-[15px]">
                              <strong className="text-[#111111]">
                                Invoice Number #:
                              </strong>{" "}
                              {invoiceNumber}
                            </p>
                          </td>
                          <td className="p-0 text-right">
                            <p className="text-[16px] text-[#111111] m-0 mb-[15px]">
                              <strong className="text-[#111111]">
                                Order #:
                              </strong>{" "}
                              {order._id}
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-0">
                            <p className="text-[16px] text-[#111111] m-0 mb-[15px]">
                              <strong className="text-[#111111]">
                                Invoice Date:
                              </strong>{" "}
                              {invoiceDate}
                            </p>
                          </td>
                          <td className="p-0 text-right">
                            <p className="text-[16px] text-[#111111] m-0 mb-[15px]">
                              <strong className="text-[#111111]">
                                Order Date:
                              </strong>{" "}
                              {orderDate}
                            </p>
                          </td>
                        </tr>

                        <tr>
                          <td colSpan={2}>
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse bg-white">
                                <colgroup>
                                  <col className="w-[35%]" />
                                  <col className="w-[15%]" />
                                  <col className="w-[15%]" />
                                  <col className="w-[12%]" />
                                  <col className="w-[8%]" />
                                  <col className="w-[15%]" />
                                </colgroup>
                                <thead>
                                  <tr className="bg-[#f6f6f6]">
                                    <th className="border border-[#ccc] p-[13px] text-left text-[14px] text-[#111111] font-semibold">
                                      Product List
                                    </th>
                                    <th className="border border-[#ccc] p-[13px] text-left text-[14px] text-[#111111] font-semibold">
                                      HSN
                                    </th>
                                    <th className="border border-[#ccc] p-[13px] text-left text-[14px] text-[#111111] font-semibold">
                                      Price
                                    </th>
                                    <th className="border border-[#ccc] p-[13px] text-left text-[14px] text-[#111111] font-semibold">
                                      GST Rate
                                    </th>
                                    <th className="border border-[#ccc] p-[13px] text-left text-[14px] text-[#111111] font-semibold">
                                      Qty
                                    </th>
                                    <th className="border border-[#ccc] p-[13px] text-right text-[14px] text-[#111111] font-semibold">
                                      Amount
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.orderItems.map((item) => {
                                    const hsn = item.product?.category?.hsnCode || globalHsnCode || "—";
                                    const gstRate =
                                      item.product?.category?.gstPercent !== undefined
                                        ? item.product.category.gstPercent
                                        : globalTax || 0;
                                    const totalAmount = item.price * item.quantity;

                                    return (
                                      <tr key={item._id}>
                                        <td className="border border-[#ccc] p-[13px] text-[14px] text-[#111111]">
                                          <div>
                                            <div>{item.name}</div>
                                            {(item.variant?.size ||
                                              item.variant?.color ||
                                              item.variant?.v_sku) && (
                                              <div className="mt-1 text-[12px] leading-[18px] text-[#555555]">
                                                {item.variant?.size && (
                                                  <div>
                                                    <strong>Variant:</strong>{" "}
                                                    {item.variant.size}
                                                  </div>
                                                )}
                                                {item.variant?.color && (
                                                  <div>
                                                    <strong>Color:</strong>{" "}
                                                    {item.variant.color}
                                                  </div>
                                                )}
                                                {item.variant?.v_sku && (
                                                  <div>
                                                    <strong>SKU:</strong>{" "}
                                                    {item.variant.v_sku}
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                        <td className="border border-[#ccc] p-[13px] text-[14px] text-[#111111]">
                                          {hsn}
                                        </td>
                                        <td className="border border-[#ccc] p-[13px] text-[14px] text-[#111111]">
                                          {money(item.price)}
                                        </td>
                                        <td className="border border-[#ccc] p-[13px] text-[14px] text-[#111111]">
                                          {gstRate}%
                                        </td>
                                        <td className="border border-[#ccc] p-[13px] text-[14px] text-[#111111]">
                                          {item.quantity}
                                        </td>
                                        <td className="border border-[#ccc] p-[13px] text-[14px] text-[#111111] text-right">
                                          {money(totalAmount)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse bg-white">
                                <colgroup>
                                  <col className="w-[39%]" />
                                  <col className="w-[35%]" />
                                  <col className="w-[15%]" />
                                </colgroup>
                                <tbody>
                                  <tr className="border-y border-[#ccc]">
                                    <td className="border-y border-l border-[#ccc] pl-[14px] text-[16px] leading-[1.55em] text-[#111111]">
                                      <strong className="text-[#111111]">
                                        Mode of Payment
                                      </strong>
                                      <br />
                                      {paymentMode}
                                    </td>
                                    <td className="border-y border-[#ccc] text-[16px] leading-[1.55em] text-left text-[#111111]">
                                      <p className="text-[#111111] text-[16px] my-4">
                                        Amount:
                                      </p>
                                      <p className="text-[#111111] text-[16px] my-4">
                                        Discount:
                                      </p>
                                      <p className="text-[#111111] text-[16px] my-4 border-b border-gray-200 pb-2">
                                        Sub Total:
                                      </p>
                                      <p className="text-[#111111] text-[16px] my-4">
                                        Shipping Charges:
                                      </p>
                                      <p className="text-[#111111] text-[16px] my-4">
                                        Platform Fee:
                                      </p>
                                    </td>
                                    <td className="border-y border-r border-[#ccc] text-[16px] leading-[1.55em] text-left text-[#111111]">
                                      <p className="text-[#111111] text-[16px] my-4 text-left">
                                        {money(order.itemsPrice)}
                                      </p>
                                      <p className="text-[#111111] text-[16px] my-4 text-left">
                                        {order.discountPrice > 0
                                          ? `- ${money(order.discountPrice)}`
                                          : money(0)}
                                      </p>
                                      <p className="text-[#111111] text-[16px] my-4 text-left border-b border-gray-200 pb-2">
                                        {money(
                                          order.itemsPrice -
                                            (order.discountPrice || 0),
                                        )}
                                      </p>
                                      <p className="text-[#111111] text-[16px] my-4 text-left">
                                        {order.shippingPrice > 0
                                          ? money(order.shippingPrice)
                                          : "FREE"}
                                      </p>
                                      <p className="text-[#111111] text-[16px] my-4 text-left">
                                        {order.taxPrice > 0
                                          ? money(order.taxPrice)
                                          : money(0)}
                                      </p>
                                    </td>
                                  </tr>
                                  <tr className="border border-[#ccc]">
                                    <td className="border-y border-l border-[#ccc] text-[16px]">
                                      &nbsp;
                                    </td>
                                    <td className="border-y border-[#ccc] text-[16px] text-left text-[#111111]">
                                      <p className="text-[#111111] text-[16px] my-4">
                                        <strong className="text-[#111111]">
                                          Total Amount:
                                        </strong>
                                      </p>
                                    </td>
                                    <td className="border-y border-ccc text-[16px] text-left text-[#111111]">
                                      <p className="text-[#111111] font-bold text-[16px] my-4 text-left">
                                        <strong className="text-[#111111]">
                                          {money(order.totalPrice)}
                                        </strong>
                                      </p>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>

                        <tr>
                          <td className="align-top text-[16px] text-[#111111]">
                            <p className="text-[16px] font-medium text-[#111111] my-4">
                              <strong className="text-[#111111]">
                                Delivery to:
                              </strong>
                            </p>
                            <p className="leading-[25px] my-4">
                              <strong>{shippingAddress.fullName || "Customer"}</strong>
                              <br />
                              {shippingAddressLines.map((line) => (
                                <span key={line}>
                                  {line}
                                  <br />
                                </span>
                              ))}
                            </p>
                            <p className="my-4">
                              <strong>Email:</strong> {order.user?.email || (order as any)?.email || "Not specified"}
                            </p>
                            <p className="my-4">
                              <strong>Phone no.:</strong>{" "}
                              {shippingAddress.phoneNumber || "Not specified"}
                            </p>
                          </td>
                          <td className="align-top text-[16px] text-[#111111]">
                            <p className="text-[16px] font-medium text-[#111111] my-4">
                              <strong className="text-[#111111]">
                                Ship to:
                              </strong>
                            </p>
                            <p className="leading-[25px] my-4">
                              <strong>{shippingAddress.fullName || "Customer"}</strong>
                              <br />
                              {shippingAddressLines.map((line) => (
                                <span key={line}>
                                  {line}
                                  <br />
                                </span>
                              ))}
                            </p>
                            <p className="my-4">
                              <strong>Email:</strong> {order.user?.email || (order as any)?.email || "Not specified"}
                            </p>
                            <p className="my-4">
                              <strong>Phone no.:</strong>{" "}
                              {shippingAddress.phoneNumber || "Not specified"}
                            </p>
                          </td>
                        </tr>

                        <tr>
                          <td className="align-top text-[16px] text-[#111111] ">
                            <p className="text-[16px] text-[#111111] my-4">
                              <strong className="text-[#111111]">
                                Bill from:
                              </strong>
                            </p>
                            <p className="leading-[25px] mt-0 mb-0">
                              <strong className="text-[#153643]">
                                Studio By Sheetal Pvt. Ltd.
                              </strong>
                              <br />
                              {billingAddressLines.map((line, idx) => (
                                <span key={`${line}-${idx}`}>
                                  {line}
                                  <br />
                                </span>
                              ))}
                            </p>
                          </td>
                          <td className="align-top text-[16px] text-[#111111]">
                            <p className="text-[16px] text-[#111111] my-4">
                              <strong className="text-[#111111]">
                                Ship from:
                              </strong>
                            </p>
                            <p className="leading-[25px] mt-0 mb-0">
                              <strong className="text-[#153643]">
                                Studio By Sheetal Pvt. Ltd.
                              </strong>
                              <br />
                              {shippingOfficeLines.map((line, idx) => (
                                <span key={`${line}-${idx}`}>
                                  {line}
                                  <br />
                                </span>
                              ))}
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <p className="my-4">&nbsp;</p>

                    <p className="m-0 text-[14px] leading-[24px]">
                      <strong>DECLARATION</strong>,<br />
                      {basicInfo.invoiceDeclaration ||
                        "The goods sold as part of this shipment are intended for end-user consumption and are not for retail sale"}
                    </p>

                    <p className="my-4">&nbsp;</p>

                    <p className="m-0 text-[14px] leading-[24px]">
                      {basicInfo.invoiceContactText ||
                        "If you have any questions, feel free to call customer care at +91 80 6156 1999 or use Contact Us section in our App, or log on to www.studiobysheetal.com/contact."}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-[#166900] px-[30px] py-[30px]">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="p-0 text-center">
                    <p className="m-0 text-[14px] leading-[16px] text-white">
                      © {basicInfo.invoiceFooterYear || new Date().getFullYear()}{" "}
                      <Link href="/" className="text-white underline">
                        {basicInfo.companyName || "Studio By Sheetal"}
                      </Link>
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="px-[30px] py-[30px] no-print">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="p-0 text-center">
                    <button
                      onClick={() => window.print()}
                      className="border border-black text-[16px] px-[13px] py-[9px] bg-transparent rounded-[4px] cursor-pointer hover:bg-gray-50"
                    >
                      Print this page
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

const InvoicePage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white p-8 rounded shadow-md text-center max-w-md w-full">
            <div className="w-12 h-12 border-4 border-[#bd9951] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading invoice...</p>
          </div>
        </div>
      }
    >
      <InvoicePageInner />
    </Suspense>
  );
};

export default InvoicePage;
