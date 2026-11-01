import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/apexrn';

export default function CardExample() {
  return (
    <Card style={{ width: 320 }}>
      <CardHeader>
        <CardTitle>Pro plan</CardTitle>
        <CardDescription>$9 a month, billed yearly.</CardDescription>
      </CardHeader>
      <CardContent>
        <CardDescription>Unlimited projects and team seats.</CardDescription>
      </CardContent>
      <CardFooter>
        <Button>Upgrade</Button>
      </CardFooter>
    </Card>
  );
}
