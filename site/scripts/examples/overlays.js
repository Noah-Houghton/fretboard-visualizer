import {colors, fretboardConfiguration} from "../config";
import { Fretboard, Systems, parseChord, dotClasses } from '../../../dist/fretboard.esm.js';


function overlaysChordDemo() {
    const $wrapper = document.querySelector('.fretboard-overlays-chords');
    const fretboard = new Fretboard({
        ...fretboardConfiguration,
        el: $wrapper.querySelector('figure'),
        dotText: ({ note, octave, interval }) => note + octave,
        dotFill: ({ interval, inBox }) =>
            !inBox
                ? colors.disabled
                : interval === '1P'
                    ? colors.defaultActiveFill
                    : colors.defaultFill,
        overlayDotText: ({ note, octave, interval }) => note + octave,
        overlayDotFill: ({ interval, inBox }) => !inBox
            ? colors.disabled
            : colors.activeOverlayFill,
        postRender: function (svg, dots, overlaySVGGroups) {
            dots.on('mouseenter', () => {
                overlaySVGGroups.map(g => g.style('opacity', 0))
            }).on('mouseleave', () => {
                overlaySVGGroups.map(g => g.style('opacity', 1))
            })
        }
    });
    fretboard.setOverlayRenderer(null, (overlayDotGroup, overlayDots, {primaryDotsNodes, context}) => {
        const overlayDotsNodes = overlayDotGroup.selectAll('g')
            .data(overlayDots)
            .enter()
            .filter(({ fret }) => fret >= 0)
            .append('g')
            .attr('class', dot => ['dot', dotClasses(dot, 'overlay')].join(' '))
            .attr('opacity', ({ disabled }) => disabled ? context.options.disabledOpacity : 1);

        const rectSize = context.options.dotSize * .75
        const dotOffset = context.getDotOffset()
        const dotStrokeColor = context.options.dotStrokeColor
        const dotStrokeWidth = context.options.dotStrokeWidth
        const overlayDotFill = 'orange'
        const dotTextSize = context.options.dotTextSize
        const overlayDotText = context.options.overlayDotText
        const positions = context.positions
        overlayDotsNodes.append('rect')
            .attr('class', 'overlay-dot-circle')
            .attr('x', ({ string, fret }) => `${positions[string - 1][fret - dotOffset].x}%`)
            .attr('y', ({ string, fret }) => positions[string - 1][fret - dotOffset].y)
            .attr('transform-origin', 'center')
            .style('transform-box', 'fill-box')
            .attr('transform', `translate(-${rectSize / 2} -${rectSize / 2}) rotate(-45)`)
            .attr('width', rectSize)
            .attr('height', rectSize)
            .attr('stroke', dotStrokeColor)
            .attr('stroke-width', dotStrokeWidth)
            .attr('fill', overlayDotFill)
            .on('mouseenter', (d) => {
                primaryDotsNodes.style('opacity', 0)
            }).on('mouseleave', (d) => {
                primaryDotsNodes.style('opacity', 1)
            })
        ;

        overlayDotsNodes.append('text')
            .attr('class', 'overlay-dot-text')
            .attr('x', ({ string, fret }) => `${positions[string - 1][fret - dotOffset].x}%`)
            .attr('y', ({ string, fret }) => positions[string - 1][fret - dotOffset].y)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', dotTextSize)
            .style('pointer-events', 'none')
            .text(overlayDotText);
    })

    const defaultScale = {
        root: 'E',
        type: 'minor pentatonic'
    };

    const overlayChord = parseChord("300xxx", true)

    fretboard.setOverlayDots(overlayChord.positions.map((d, i) => {return {...d, overlayGroup: null}}), {
        ...defaultScale,
        box: {
            system: Systems.pentatonic,
            box: 1
        }
    })
    fretboard.renderScale({
        ...defaultScale,
        box: {
            system: Systems.pentatonic,
            box: 1
        }
    });
}

export default function overlays() {
    overlaysChordDemo()
}