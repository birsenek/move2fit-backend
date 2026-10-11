// Regressão linear por mínimos quadrados: peso = intercepto + coeficiente * semanas.
// Cada avaliação de teste usa somente registros anteriores (validação walk-forward).
export function tendencia(
  registros: { dataColeta: string; peso: number; altura: number }[],
) {
  const dados = [...registros].sort((a, b) =>
    a.dataColeta.localeCompare(b.dataColeta),
  );
  if (dados.length < 5) return null;
  const inicio = Date.parse(dados[0].dataColeta);
  const xs = dados.map((a) => (Date.parse(a.dataColeta) - inicio) / 604800000);
  const ys = dados.map((a) => Number(a.peso));
  const fit = (x: number[], y: number[]) => {
    const mx = x.reduce((a, b) => a + b, 0) / x.length,
      my = y.reduce((a, b) => a + b, 0) / y.length;
    const den = x.reduce((s, v) => s + (v - mx) ** 2, 0);
    const coeficiente = den
      ? x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0) / den
      : 0;
    return { coeficiente, intercepto: my - coeficiente * mx };
  };
  let erro = 0,
    baseline = 0;
  for (let i = 3; i < dados.length; i++) {
    const modelo = fit(xs.slice(0, i), ys.slice(0, i));
    erro += Math.abs(ys[i] - (modelo.intercepto + modelo.coeficiente * xs[i]));
    baseline += Math.abs(ys[i] - ys[i - 1]);
  }
  const modelo = fit(xs, ys),
    ultimo = dados[dados.length - 1];
  const peso = modelo.intercepto + modelo.coeficiente * (xs[xs.length - 1] + 1);
  const round = (v: number) => Number(v.toFixed(2));
  return {
    metodo: 'Regressão linear (mínimos quadrados)',
    amostras: dados.length,
    coeficiente: round(modelo.coeficiente),
    intercepto: round(modelo.intercepto),
    mae: round(erro / (dados.length - 3)),
    maeBaseline: round(baseline / (dados.length - 3)),
    testes: dados.length - 3,
    ajuste: dados.map((a, i) => ({
      dataColeta: a.dataColeta,
      peso: round(modelo.intercepto + modelo.coeficiente * xs[i]),
    })),
    previsao:
      peso > 0
        ? {
            dataColeta: new Date(Date.parse(ultimo.dataColeta) + 604800000)
              .toISOString()
              .slice(0, 10),
            peso: round(peso),
            imc: round(peso / Number(ultimo.altura) ** 2),
          }
        : null,
  };
}
