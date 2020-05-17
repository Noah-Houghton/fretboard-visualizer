import { select, Selection, ValueFn, BaseType } from 'd3-selection';
import { Dot } from './scales/scales';

function dotClasses(dot: Dot, prefix: string): string {
  return [
    `dot-${prefix}`,
      ...Object.entries(dot)
        .map(([key, value]: [string, string]) => `dot-${prefix}-${key}-${value}`)
  ].join(' ');
}

function generateStrings({
  stringCount,
  stringWidth,
  height
}: {
  stringCount: number;
  stringWidth: number;
  height: number;
}): number[] {
  const strings = [];

  for (let i = 0; i < stringCount; i++) {
    let y = (height / (stringCount - 1)) * i;
    if (i === 0) {
      y += stringWidth;
    }
    if (i === stringCount - 1) {
      y -= stringWidth;
    }
    strings.push(y);
  }
  return strings;
}

function generateFrets ({
  scaleFrets,
  fretCount
}: {
  scaleFrets: boolean;
  fretCount: number;
}): number[] {
  const fretRatio = Math.pow(2, 1 / 12);
  const frets = [0];

  for (let i = 1; i <= fretCount; i++) {
    let x = (100 / fretCount) * i;
    if (scaleFrets) {
      x = 100 - 100 / Math.pow(fretRatio, i);
    }
    frets.push(x);
  }
  return frets.map(x => x / frets[frets.length - 1] * 100);
}

const MIDDLE_FRET = 11;

export const defaultOptions = {
  el: '',
  stringCount: 6,
  stringWidth: 1,
  stringColor: 'black',
  fretCount: 15,
  fretWidth: 1,
  fretColor: 'black',
  nutWidth: 7,
  nutColor: 'black',
  middleFretColor: 'red',
  middleFretWidth: 3,
  scaleFrets: true,
  topPadding: 20,
  bottomPadding: 15,
  leftPadding: 20,
  rightPadding: 20,
  height: 150,
  width: 960,
  dotSize: 20,
  dotStrokeColor: 'black',
  dotStrokeWidth: 2,
  dotTextSize: 12,
  dotFill: 'white',
  dotText: '',
  disabledOpacity: 0.9,
  showFretsNumber: true,
  fretsNumberHeight: 40,
  fretNumbersMargin: 20,
  fretNumbersColor: '#00000099',
  font: 'Arial'
};

function getDimensions ({
  topPadding,
  bottomPadding,
  leftPadding,
  rightPadding,
  width,
  height,
  showFretsNumber,
  fretsNumberHeight
}: {
  topPadding: number;
  bottomPadding: number;
  leftPadding: number;
  rightPadding: number;
  width: number;
  height: number;
  showFretsNumber: boolean;
  fretsNumberHeight: number;
}): {
  totalWidth: number;
  totalHeight: number;
} {
  const totalWidth = width + leftPadding + rightPadding;
  let totalHeight = height + topPadding + bottomPadding;

  if (showFretsNumber) {
    totalHeight += fretsNumberHeight;
  }
  return { totalWidth, totalHeight };
}

type Options = {
  el: string;
  stringCount: number;
  stringWidth: number;
  stringColor: string;
  fretCount: number;
  fretWidth: number;
  fretColor: string;
  nutWidth: number;
  nutColor: string;
  middleFretColor: string;
  middleFretWidth: number;
  scaleFrets: boolean;
  topPadding: number;
  bottomPadding: number;
  leftPadding: number;
  rightPadding: number;
  height: number;
  width: number;
  dotSize: number;
  dotStrokeColor: string;
  dotStrokeWidth: number;
  dotTextSize: number;
  dotFill: string;
  dotText: string;
  disabledOpacity: number;
  showFretsNumber: boolean;
  fretsNumberHeight: number;
  fretNumbersMargin: number;
  fretNumbersColor: string;
  font: string;
}

type Point = {
  x: number;
  y: number;
}

export class Fretboard {
  options: Options;
  strings: number[];
  frets: number[];
  positions: Point[][];
  svg: Selection<BaseType, unknown, HTMLElement, unknown>;
  private baseRendered: boolean;
  constructor (options: object) {
    this.options = Object.assign(defaultOptions, options);
    const {
      el,
      height,
      width,
      leftPadding,
      topPadding,
      stringCount,
      stringWidth,
      fretCount,
      scaleFrets
    } = this.options;

    this.strings = generateStrings({ stringCount, height, stringWidth });
    this.frets = generateFrets({ fretCount, scaleFrets });
    const { frets, strings } = this;
    const { totalWidth, totalHeight } = getDimensions(this.options);

    function getDotCoords ({
      fret,
      string
    }: {
      fret: number;
      string: number;
    }): Point {
      let x = 0;
      if (fret === 0) {
        x = frets[0] / 2;
      } else {
        x = frets[fret] - (frets[fret] - frets[fret - 1]) / 2;
      }
      return { x, y: strings[string - 1] };
    }

    function generatePositions({
      fretCount,
      stringCount
    }: {
      fretCount: number;
      stringCount: number;
    }): Point[][] {
      const positions = [];
      for (let string = 1; string <= stringCount; string++) {
        const currentString = [];
        for (let fret = 0; fret < fretCount; fret++) {
          currentString.push(getDotCoords({ fret, string }))
        }
        positions.push(currentString);
      }
      return positions;
    }

    this.positions = generatePositions(this.options);

    this.svg = select(el)
      .append('svg')
      .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
      .append('g')
      .attr('class', 'fretboard-wrapper')
      .attr('transform', `translate(${leftPadding}, ${topPadding}) scale(${width / totalWidth})`);
  }

  _baseRender(): void {
    if (this.baseRendered) {
      return;
    }

    const {
      svg,
      frets,
      strings
    } = this;

    const {
      height,
      font,
      nutColor,
      nutWidth,
      stringColor,
      stringWidth,
      fretColor,
      fretWidth,
      middleFretWidth,
      middleFretColor,
      showFretsNumber,
      fretNumbersMargin,
      fretNumbersColor,
      topPadding
    } = this.options;

    const { totalWidth } = getDimensions(this.options);

    const stringGroup = svg
      .append('g')
      .attr('class', 'strings');

    stringGroup
      .selectAll('line')
      .data(strings)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('y1', d => d)
      .attr('x2', '100%')
      .attr('y2', d => d)
      .attr('stroke', stringColor)
      .attr('stroke-width', stringWidth);

    const fretsGroup = svg
      .append('g')
      .attr('class', 'frets');

    const fretNumbersGroup = svg
      .append('g')
      .attr('class', 'fret-numbers')
      .attr('transform', `translate(0 ${fretNumbersMargin + topPadding + strings[strings.length - 1]})`);

    fretsGroup
      .selectAll('line')
      .data(frets)
      .enter()
      .append('line')
      .attr('x1', d => `${d}%`)
      .attr('y1', 1)
      .attr('x2', d => `${d}%`)
      .attr('y2', height - 1)
      .attr('stroke', (_d, i) => {
        switch(i) {
          case 0:
            return nutColor;
          case MIDDLE_FRET:
            return middleFretColor;
          default:
            return fretColor;
        }
      })
      .attr('stroke-width', (_d, i) => {
        switch(i) {
          case 0:
            return nutWidth;
          case MIDDLE_FRET:
            return middleFretWidth;
          default:
            return fretWidth;
        }
      });

    if (showFretsNumber) {
      fretNumbersGroup
        .selectAll('text')
        .data(frets.slice(1))
        .enter()
        .append('text')
        .attr('x', (d, i) => totalWidth / 100 * (d - (d - frets[i]) / 2))
        .attr('fill', (_d, i) => i === MIDDLE_FRET ? middleFretColor : fretNumbersColor)
        .attr('font-family', font)
        .attr('text-anchor', 'middle')
        .text((_d, i) => `${i + 1}`)
    }

    this.baseRendered = true;
  }

  render (dots: Dot[]): Fretboard {
    this._baseRender();

    if (!dots.length) {
      return this;
    }

    const {
      svg,
      positions
    } = this;

    const {
      font,
      dotStrokeColor,
      dotStrokeWidth,
      dotFill,
      dotSize,
      dotText,
      dotTextSize,
      disabledOpacity
    } = this.options;

    svg.select('.dots').remove();

    const dotGroup = svg
      .append('g')
      .attr('class', 'dots');

    const dotsNodes = dotGroup.selectAll('g')
      .data(dots)
      .enter()
      .append('g')
      .attr('class', ({ disabled }) => disabled ? 'dot dot-disabled' : 'dot')
      .attr('opacity', ({ disabled }) => disabled ? disabledOpacity : 1);

    dotsNodes.append('circle')
      .attr('cx', ({ string, fret }) => `${positions[string - 1][fret].x}%`)
      .attr('cy', ({ string, fret }) => positions[string - 1][fret].y)
      .attr('r', dotSize * 0.5)
      .attr('class', (dot: Dot) => dotClasses(dot, 'circle'))
      .attr('stroke', dotStrokeColor)
      .attr('stroke-width', dotStrokeWidth)
      .attr('fill', dotFill);

    dotsNodes.append('text')
      .attr('x', ({ string, fret }) => `${positions[string - 1][fret].x}%`)
      .attr('y', ({ string, fret }) => positions[string - 1][fret].y)
      .attr('class', (dot: Dot) => dotClasses(dot, 'text'))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-family', font)
      .attr('font-size', dotTextSize)
      .text(dotText);

    return this;
  }

  dots ({
    filter = (): boolean => true,
    text,
    fontSize,
    ...opts
  }: {
    filter: ValueFn<BaseType, unknown, boolean>;
    text: ValueFn<BaseType, unknown, string>;
    fontSize: number;
  }): Fretboard {
    const { svg } = this;
    const { dotTextSize } = this.options;
    const dots = svg.selectAll('.dot-circle')
      .filter(filter);

    Object.keys(opts).forEach(
      key => dots.attr(key, (opts as { [key: string]: string })[key])
    );

    if (text) {
      svg.selectAll('.dot-text')
        .filter(filter)
        .text(text)
        .attr('font-size', fontSize || dotTextSize);
    }

    return this;
  }
}
