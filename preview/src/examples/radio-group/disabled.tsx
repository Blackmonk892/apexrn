import { RadioGroup, RadioGroupItem } from '@/components/apexrn';

export default function RadioGroupDisabledExample() {
  return (
    <RadioGroup defaultValue="monthly">
      <RadioGroupItem value="monthly" label="Monthly" />
      <RadioGroupItem value="yearly" label="Yearly" />
      <RadioGroupItem value="lifetime" label="Lifetime (sold out)" disabled />
    </RadioGroup>
  );
}
