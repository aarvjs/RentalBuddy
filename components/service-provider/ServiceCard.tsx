import React from "react";
import { Sparkles, MapPin, Clock, Tag, ToggleLeft, ToggleRight, Image as ImageIcon } from "lucide-react";
import { ProviderService, ServiceStatus } from "@/types/service-provider";

interface ServiceCardProps {
  service: ProviderService;
  onToggleStatus?: (serviceId: string, currentStatus: ServiceStatus) => void;
}

export function ServiceCard({ service, onToggleStatus }: ServiceCardProps) {
  const isPaused = service.status === "paused";
  const mainImage = service.serviceImages?.[0];

  return (
    <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-pink-100/90 shadow-lg shadow-pink-500/5 hover:border-pink-200 transition-all overflow-hidden flex flex-col group">
      <div className="relative h-44 w-full bg-gradient-to-tr from-pink-100 via-rose-100 to-purple-100 overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={service.serviceName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-purple-900/40">
            <ImageIcon className="w-8 h-8 mb-1" />
            <span className="text-xs font-semibold">No Image Provided</span>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-pink-600 shadow-sm border border-pink-100">
          {service.category}
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold shadow-sm border ${
              isPaused
                ? "bg-amber-100/90 text-amber-800 border-amber-200"
                : "bg-emerald-100/90 text-emerald-800 border-emerald-200"
            }`}
          >
            {isPaused ? "Paused" : "Active"}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-extrabold text-base text-purple-950 mb-2 group-hover:text-pink-600 transition-colors">
            {service.serviceName}
          </h4>
          <p className="text-xs text-purple-900/70 line-clamp-2 mb-4 leading-relaxed">
            {service.description}
          </p>

          <div className="space-y-2 mb-4 text-xs font-medium text-purple-900/80">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-pink-500" />
              <span>Duration: {service.duration}</span>
            </div>
            {service.serviceArea && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-purple-500" />
                <span>Service Area: {service.serviceArea}</span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-pink-100 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-900/50 block">Pricing</span>
            <span className="text-base font-extrabold text-purple-950">
              ₹{service.price?.toLocaleString("en-IN")}{" "}
              <span className="text-xs font-normal text-purple-900/60">
                / {service.priceType}
              </span>
            </span>
          </div>

          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(service.id, service.status)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-pink-50 hover:bg-pink-100 border border-pink-200 text-purple-950 transition-colors"
            >
              {isPaused ? (
                <>
                  <ToggleLeft className="w-4 h-4 text-amber-500" /> Activate
                </>
              ) : (
                <>
                  <ToggleRight className="w-4 h-4 text-emerald-500" /> Pause
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
