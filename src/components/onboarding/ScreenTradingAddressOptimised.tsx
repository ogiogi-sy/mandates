import { useState } from 'react';
import { Check, UploadCloud, ChevronDown, ChevronUp, MapPin, Building2, Search, Info } from 'lucide-react';
import { StickyFooter } from './StickyFooter';

interface ScreenTradingAddressOptimisedProps {
  registeredAddress: string;
  onContinue: (type: 'registered' | 'custom' | 'document', value: string) => void;
}

export function ScreenTradingAddressOptimised({ registeredAddress, onContinue }: ScreenTradingAddressOptimisedProps) {
  const [selectedType, setSelectedType] = useState<'registered' | 'custom' | 'document'>('registered');
  const [postcode, setPostcode] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showDocTooltip, setShowDocTooltip] = useState(false);

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

  // Helper to expand custom input
  const isCustomExpanded = selectedType === 'custom';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-brand-navy mb-2">Trading Address</h2>
        <p className="text-text-secondary">Where does your business operate from?</p>
      </div>

      <div className="bg-white rounded-[20px] border border-divider overflow-hidden shadow-sm">
        {/* Option 1: Registered Address */}
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
            <span className="font-bold text-brand-navy block mb-1">Use registered address</span>
            <p className="text-sm text-text-secondary flex items-start gap-1.5">
              <Building2 size={14} className="mt-0.5 shrink-0" />
              {registeredAddress}
            </p>
          </div>
        </button>

        {/* Option 2: Different Address */}
        <div className="border-b border-divider">
          <button 
            onClick={() => setSelectedType('custom')}
            className="w-full p-5 text-left flex items-center justify-between group hover:bg-offwhite-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                selectedType === 'custom' ? 'border-brand-blue bg-brand-blue' : 'border-divider'
              }`}>
                {selectedType === 'custom' && <Check size={14} className="text-white" strokeWidth={3} />}
              </div>
              <span className="font-bold text-brand-navy">Enter a different address</span>
            </div>
          </button>

          {isCustomExpanded && (
            <div className="px-5 pb-5 pl-[60px] animate-in fade-in slide-in-from-top-2 space-y-3">
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
                  Find address
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

        {/* Option 3: Upload Document */}
        <div className="p-5">
           <button 
            onClick={() => setSelectedType('document')}
            className="w-full text-left flex items-center gap-4 hover:bg-offwhite-50 transition-colors rounded-lg -ml-2 p-2"
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              selectedType === 'document' ? 'border-brand-blue bg-brand-blue' : 'border-divider'
            }`}>
              {selectedType === 'document' && <Check size={14} className="text-white" strokeWidth={3} />}
            </div>
            <div className="flex-1">
              <span className="font-bold text-brand-navy block mb-0.5">Upload proof of address</span>
              <p className="text-xs text-text-secondary">Utility bill or bank statement (last 3 months)</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowDocTooltip(!showDocTooltip); }}
              className="text-text-secondary hover:text-brand-blue transition-colors p-1 rounded-full"
              aria-label="More info about accepted documents"
            >
              <Info size={16} />
            </button>
          </button>
          {showDocTooltip && (
            <div className="ml-[52px] mt-2 p-3 bg-[#E5ECF5] rounded-xl text-sm text-brand-navy animate-in fade-in">
              <p className="font-semibold mb-1">Accepted documents</p>
              <ul className="list-disc ml-4 text-text-secondary space-y-0.5 text-xs">
                <li>Utility bill (gas, electric, water) — dated within 3 months</li>
                <li>Bank or building society statement — dated within 3 months</li>
                <li>Commercial lease agreement — current and signed</li>
              </ul>
            </div>
          )}

          {selectedType === 'document' && (
            <div className="mt-4 ml-[52px] animate-in fade-in">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-divider rounded-xl hover:bg-offwhite-50 cursor-pointer transition-colors bg-offwhite-50/30">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 text-brand-blue mb-2" />
                  <p className="mb-1 text-sm text-brand-navy font-semibold">
                    {uploadedFile ? uploadedFile.name : 'Click to upload'}
                  </p>
                  <p className="text-xs text-text-secondary">PDF, JPG or PNG</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setUploadedFile(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      <StickyFooter>
        <button
          onClick={() => {
            let value = '';
            if (selectedType === 'registered') value = registeredAddress;
            if (selectedType === 'custom') value = selectedAddress;
            if (selectedType === 'document') value = uploadedFile ? uploadedFile.name : 'Document uploaded';

            onContinue(selectedType, value);
          }}
          disabled={
            (selectedType === 'custom' && selectedAddress.length < 5) ||
            (selectedType === 'document' && !uploadedFile)
          }
          className="w-full bg-primary text-primary-foreground h-12 rounded-full font-bold text-base hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/10"
        >
          Continue
        </button>
      </StickyFooter>
    </div>
  );
}