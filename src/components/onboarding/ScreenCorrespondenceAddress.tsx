import { useState } from 'react';
import { Check, Building2, MapPin, Search } from 'lucide-react';
import { StickyFooter } from './StickyFooter';

interface ScreenCorrespondenceAddressProps {
  registeredAddress: string;
  tradingAddress: string | null;
  tradingAddressDiffers: boolean;
  onContinue: (type: 'registered' | 'trading' | 'custom', value: string) => void;
}

export function ScreenCorrespondenceAddress({
  registeredAddress,
  tradingAddress,
  tradingAddressDiffers,
  onContinue,
}: ScreenCorrespondenceAddressProps) {
  const [selectedType, setSelectedType] = useState<'registered' | 'trading' | 'custom'>('registered');
  const [postcode, setPostcode] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handlePostcodeSearch = () => {
    if (postcode.trim().length < 3) return;
    // Mock address results for prototype
    setSearchResults([
      `1 High Street, ${postcode.toUpperCase()}, London`,
      `2 High Street, ${postcode.toUpperCase()}, London`,
      `3 Station Road, ${postcode.toUpperCase()}, London`,
      `4 Church Lane, ${postcode.toUpperCase()}, London`,
    ]);
    setHasSearched(true);
    setSelectedAddress('');
  };

  const isValid =
    selectedType === 'registered' ||
    selectedType === 'trading' ||
    (selectedType === 'custom' && selectedAddress.length > 0);

  const getValue = () => {
    if (selectedType === 'registered') return registeredAddress;
    if (selectedType === 'trading') return tradingAddress || registeredAddress;
    return selectedAddress;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-brand-navy mb-2">Correspondence address</h2>
        <p className="text-text-secondary">Where should we send your post?</p>
      </div>

      <div className="bg-white rounded-[20px] border border-divider overflow-hidden shadow-sm">
        {/* Option 1: Registered address */}
        <button
          onClick={() => setSelectedType('registered')}
          className="w-full p-5 text-left flex items-start gap-4 hover:bg-offwhite-50 transition-colors border-b border-divider"
        >
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
            selectedType === 'registered' ? 'border-brand-blue bg-brand-blue' : 'border-divider'
          }`}>
            {selectedType === 'registered' && <Check size={14} className="text-white" strokeWidth={3} />}
          </div>
          <div>
            <span className="font-bold text-brand-navy block mb-1">Same as registered address</span>
            <p className="text-sm text-text-secondary flex items-start gap-1.5">
              <Building2 size={14} className="mt-0.5 shrink-0" />
              {registeredAddress}
            </p>
          </div>
        </button>

        {/* Option 2: Trading address — only shown if it differs */}
        {tradingAddressDiffers && tradingAddress && (
          <button
            onClick={() => setSelectedType('trading')}
            className="w-full p-5 text-left flex items-start gap-4 hover:bg-offwhite-50 transition-colors border-b border-divider"
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
              selectedType === 'trading' ? 'border-brand-blue bg-brand-blue' : 'border-divider'
            }`}>
              {selectedType === 'trading' && <Check size={14} className="text-white" strokeWidth={3} />}
            </div>
            <div>
              <span className="font-bold text-brand-navy block mb-1">Same as trading address</span>
              <p className="text-sm text-text-secondary flex items-start gap-1.5">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                {tradingAddress}
              </p>
            </div>
          </button>
        )}

        {/* Option 3: Different address with postcode finder */}
        <div className="p-5">
          <button
            onClick={() => setSelectedType('custom')}
            className="w-full text-left flex items-center gap-4 hover:bg-offwhite-50 transition-colors rounded-lg -ml-2 p-2"
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              selectedType === 'custom' ? 'border-brand-blue bg-brand-blue' : 'border-divider'
            }`}>
              {selectedType === 'custom' && <Check size={14} className="text-white" strokeWidth={3} />}
            </div>
            <span className="font-bold text-brand-navy">A different address</span>
          </button>

          {selectedType === 'custom' && (
            <div className="mt-4 ml-[52px] animate-in fade-in slide-in-from-top-2 space-y-3">
              {/* Postcode search */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => {
                    setPostcode(e.target.value);
                    setHasSearched(false);
                    setSearchResults([]);
                    setSelectedAddress('');
                  }}
                  placeholder="Enter postcode"
                  className="flex-1 p-3 rounded-xl border border-divider bg-offwhite-50 focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all text-sm"
                />
                <button
                  onClick={handlePostcodeSearch}
                  disabled={postcode.trim().length < 3}
                  className="px-4 py-3 rounded-xl bg-brand-blue text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                >
                  <Search size={14} />
                  Find
                </button>
              </div>

              {/* Search results */}
              {hasSearched && searchResults.length > 0 && (
                <div className="border border-divider rounded-xl overflow-hidden bg-white">
                  {searchResults.map((address, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedAddress(address)}
                      className={`w-full p-3 text-left text-sm flex items-center gap-3 transition-colors ${
                        idx > 0 ? 'border-t border-divider' : ''
                      } ${selectedAddress === address
                        ? 'bg-[#E5ECF5] text-brand-navy font-semibold'
                        : 'hover:bg-offwhite-50 text-text-secondary'
                      }`}
                    >
                      {selectedAddress === address && (
                        <Check size={14} className="text-brand-blue shrink-0" strokeWidth={3} />
                      )}
                      <span className={selectedAddress === address ? '' : 'ml-[26px]'}>{address}</span>
                    </button>
                  ))}
                </div>
              )}

              {hasSearched && searchResults.length === 0 && (
                <p className="text-sm text-text-secondary">
                  No addresses found. Check your postcode and try again.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <StickyFooter>
        <button
          onClick={() => onContinue(selectedType, getValue())}
          disabled={!isValid}
          className="w-full bg-primary text-primary-foreground h-12 rounded-full font-bold text-base hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/10"
        >
          Continue
        </button>
      </StickyFooter>
    </div>
  );
}
