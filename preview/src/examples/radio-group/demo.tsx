import { RadioGroup, RadioGroupItem } from '@/components/apexrn';

export default function RadioGroupExample() {
  return (
    <RadioGroup defaultValue="standard" onValueChange={(value) => console.log(value)}>
      <RadioGroupItem value="standard" label="Standard, 5 days" />
      <RadioGroupItem value="express" label="Express, 2 days" />
      <RadioGroupItem value="pickup" label="Pick up in store" />
    </RadioGroup>
  );
}
