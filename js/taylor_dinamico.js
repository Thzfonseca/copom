// js/taylor_dinamico.js

document.addEventListener('DOMContentLoaded', () => {
    const inflacaoAtualInput = document.getElementById('inflacaoAtual');
    const hiatoProdutoInput = document.getElementById('hiatoProduto');
    const pesoInflacaoInput = document.getElementById('pesoInflacao');
    const pesoHiatoInput = document.getElementById('pesoHiato');
    const metaInflacaoInput = document.getElementById('metaInflacao');
    const juroNeutroInput = document.getElementById('juroNeutro');
    const calcularButton = document.getElementById('calcularTaylor');
    const resultadoDiv = document.getElementById('resultadoTaylor');

    const pesoInflacaoValor = document.getElementById('pesoInflacaoValor');
    const pesoHiatoValor = document.getElementById('pesoHiatoValor');

    if (!inflacaoAtualInput || !hiatoProdutoInput || !pesoInflacaoInput || !pesoHiatoInput ||
        !metaInflacaoInput || !juroNeutroInput || !calcularButton || !resultadoDiv) {
        console.error('Elementos do simulador Taylor não encontrados.');
        return;
    }

    pesoInflacaoInput.addEventListener('input', () => {
        pesoInflacaoValor.textContent = pesoInflacaoInput.value;
    });

    pesoHiatoInput.addEventListener('input', () => {
        pesoHiatoValor.textContent = pesoHiatoInput.value;
    });

    calcularButton.addEventListener('click', () => {
        const p = parseFloat(inflacaoAtualInput.value);
        const y = parseFloat(hiatoProdutoInput.value);
        const a = parseFloat(pesoInflacaoInput.value);
        const b = parseFloat(pesoHiatoInput.value);
        const pStar = parseFloat(metaInflacaoInput.value);
        const rStar = parseFloat(juroNeutroInput.value);

        const r = p + a * (p - pStar) + b * y + rStar;

        resultadoDiv.innerHTML = `
            <h4>Resultado:</h4>
            <p>Taxa Selic sugerida pela Regra de Taylor:</p>
            <div class="resultado-valor">${r.toFixed(2)}%</div>
        `;
    });
});
