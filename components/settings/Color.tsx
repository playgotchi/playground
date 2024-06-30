import { Label } from "@/components/ui/label";

type Props = {
  inputRef: any;
  attribute: string;
  placeholder: string;
  attributeType: string;
  handleInputChange: (property: string, value: string) => void;
};

const Color = ({
  inputRef,
  attribute,
  placeholder,
  attributeType,
  handleInputChange,
}: Props) => (
  <div className='flex items-center gap-3 border-b border-slate-700 p-5'>
    <h3 className='text-[10px] uppercase'>{placeholder}</h3>
    <div
      className='flex items-center gap-2 border border-slate-200'
      onClick={() => inputRef.current.click()}
    >
      <input
        type='color'
        value={attribute}
        ref={inputRef}
        onChange={(e) => handleInputChange(attributeType, e.target.value)}
      />
      <Label className='flex-1'>{attribute}</Label>
    </div>
  </div>
);

export default Color;