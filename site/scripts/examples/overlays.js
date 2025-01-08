import {colors, fretboardConfiguration} from "../config";
import { Fretboard, Systems, parseChord } from '../../../dist/fretboard.esm.js';


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
        postRender: function (svg, dots, overlayDots) {
            overlayDots.on('mouseover', function () {
                dots.style('opacity', '0')
            }).on('mouseout', function () {
                dots.style('opacity', '1')
            })
            dots.on('mouseover', function () {
                overlayDots.style('opacity', '0')
            }).on('mouseout', function () {
                overlayDots.style('opacity', '1')
            })
        }
    });

    const defaultScale = {
        root: 'E',
        type: 'minor pentatonic'
    };

    const overlayChord = parseChord("300xxx", true)

    fretboard.setOverlayDots(overlayChord.positions, {
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