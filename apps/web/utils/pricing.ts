const vatRate = 0.1

function calculateIncludedVat(totalPrice: number) {
  return Math.round(totalPrice - totalPrice / (1 + vatRate))
}

export { calculateIncludedVat, vatRate }
