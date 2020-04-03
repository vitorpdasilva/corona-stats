export default function formatThousands(number) {
 if (isNaN(number)) return;
 return number.toLocaleString()
}