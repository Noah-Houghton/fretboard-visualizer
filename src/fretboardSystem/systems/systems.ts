import { chroma as getChroma } from '@tonaljs/note';
import { get as getMode } from '@tonaljs/mode';
import { Position } from '../../fretboard/Fretboard';

export enum Systems {
    pentatonic = 'pentatonic',
    CAGED = 'CAGED',
    TNPS = 'TNPS',
    chord = 'chord',
}

type ScaleDefinition = {
    box: string[];
    baseChroma: number;
    baseOctave: number;
}

type GetBoxParams = {
    root: string;
    box: number|string;
    mode?: number|string;
    system: string;
}

type GetBoxInSystemParams = {
    root: string;
    box: number|string;
    modeNumber?: number|string;
    system: string;
}

const DEFAULT_MODE = 0;
const DEFAULT_PENTATONIC_MODE = 5;
const CAGED_ORDER = 'GEDCA';
const CHORD_ORDER = ["Fifth", "Seventh", "Root", "Third"]

const knownSystems: Record<string, Function> = {} // populate this using registerSystem

export function registerSystem (key: string, getBoxInSystem: (args: GetBoxInSystemParams) => ScaleDefinition|null): void {
    if (key in knownSystems) {
        throw new Error(`Attempt to overwrite existing system ${key}`)
    }
    knownSystems[key] = getBoxInSystem
}


const CAGEDDefinition: ScaleDefinition[] = [
    {
        box: [
            '-6-71',
            '-34-5',
            '71-2-',
            '-5-6-',
            '-2-34',
            '-6-71'
        ],
        baseChroma: getChroma('G#'),
        baseOctave: 2
    },        
    {
        box: [
            '71-2',
            '-5-6',
            '2-34',
            '6-71',
            '34-5',
            '71-2'
        ],
        baseChroma: getChroma('E#'),
        baseOctave: 2
    },    
    {
        box: [
            '-2-34',
            '-6-71',
            '34-5',
            '71-2-',
            '-5-6-',
            '-2-34'
        ],
        baseChroma: getChroma('D#'),
        baseOctave: 3
    },    
    {
        box: [
            '34-5',
            '71-2',
            '5-6-',
            '2-34',
            '6-71',
            '34-5'
        ],
        baseChroma: getChroma('C'),
        baseOctave: 3
    },    
    {
        box: [
            '-5-6-',
            '-2-34',
            '6-71-',
            '34-5-',
            '71-2-',
            '-5-6-'
        ],
        baseChroma: getChroma('A#'),
        baseOctave: 2
    }
]

const TNPSDefinition: ScaleDefinition[] = [
    {
        box: [
            '--2-34',
            '--6-71',
            '-34-5-',
            '-71-2-',
            '4-5-6-',
            '1-2-3-'
        ],
        baseChroma: getChroma('E'),
        baseOctave: 2
    },
    {
        box: [
            '--34-5',
            '--71-2',
            '4-5-6-',
            '1-2-3-',
            '5-6-7-',
            '2-34--'
        ],
        baseChroma: getChroma('D'),
        baseOctave: 3
    },
    {
        box: [
            '-4-5-6',
            '-1-2-3',
            '5-6-7-',
            '2-34--',
            '6-71--',
            '34-5--'
        ],
        baseChroma: getChroma('C'),
        baseOctave: 3
    },
    {
        box: [
            '--5-6-7',
            '--2-34-',
            '-6-71--',
            '-34-5--',
            '-71-2--',
            '4-5-6--'
        ],
        baseChroma: getChroma('B'),
        baseOctave: 2
    },
    {
        box: [
            '--6-71',
            '--34-5',
            '-71-2-',
            '4-5-6-',
            '1-2-3-',
            '5-6-7-'
        ],
        baseChroma: getChroma('A'),
        baseOctave: 2
    },
    {
        box: [
            '--71-2',
            '-4-5-6',
            '1-2-3-',
            '5-6-7-',
            '2-34--',
            '6-71--'
        ],
        baseChroma: getChroma('G'),
        baseOctave: 2
    },
    {
        box: [
            '-1-2-3',
            '-5-6-7',
            '2-34--',
            '6-71--',
            '34-5--',
            '71-2--'
        ],
        baseChroma: getChroma('F'),
        baseOctave: 2
    }
];

const ChordDefinition: ScaleDefinition[] = [
    {
        box: [
            '-5----',
            '-2-34-',
            '6-71--',
            '34-5--',
            '71-2--',
            '-5-6--',
        ],
        baseChroma: getChroma('A#'),
        baseOctave: 2
    },
    {
        box: [
            '--6-7-',
            '--34-5',
            '-71-2-',
            '--5-6-',
            '--2-34',
            '----71'
        ],
        baseChroma: getChroma('A'),
        baseOctave: 3
    },
    {
        box: [
            '--71--',
            '---5-6',
            '--2-34',
            '--6-71',
            '--34-5',
            '---1-2'
        ],
        baseChroma: getChroma('G'),
        baseOctave: 4
    },
    {
        box: [
            '--2-3-',
            '--6-71',
            '-34-5-',
            '-71-2-',
            '--5-6-',
            '----34'
        ],
        baseChroma: getChroma('E'),
        baseOctave: 4
    },
];

export function getModeFromScaleType(type: string): number {
    const { modeNum } = getMode(type.replace('pentatonic', '').trim());
    return modeNum;
}

function getModeOffset(mode: number): number {
    return getChroma('CDEFGAB'.split('')[mode]);
}

function getPentatonicBoxIndex(box: number, mode: number): number {
    if (mode === DEFAULT_PENTATONIC_MODE) {
        return box - 1;
    }
    return box % 5;
}

function getBoxPositions({
    root,
    box,
    modeOffset = 0,
    baseChroma
}: {
    root: string;
    box: string[];
    modeOffset: number;
    baseChroma: number;
}): Position[] {
    let delta = getChroma(root) - baseChroma - modeOffset;
    while (delta < -1) {
        delta += 12;
    }
    return box.reduce((memo, item, string) => ([
        ...memo,
        ...item.split('').map(
            (x, i) => x !== '-'
                ? { string: string + 1, fret: i + delta }
                : null
            ).filter(x => !!x)
    ]), []);
}

export function getBox({
    root,
    mode = -1,
    system,
    box
}: GetBoxParams): Position[] {
    let modeNumber = system === Systems.pentatonic
        ? DEFAULT_PENTATONIC_MODE
        : DEFAULT_MODE;        

    if (typeof mode === 'string') {
        modeNumber = getModeFromScaleType(mode);
    } else if (mode > -1) {
        modeNumber = mode;
    }

    const getBoxInSystem = knownSystems[system]
    if (!getBoxInSystem) {
        throw new Error(`System ${system} not found`);
    }
    const foundBox: ScaleDefinition|null = getBoxInSystem({root, modeNumber, system, box});
    
    if (!foundBox) {
        throw new Error(`Cannot find box ${box} in the ${system} scale system`);
    }

    const { baseChroma, box: boxDefinition } = foundBox;

    return getBoxPositions({
        root,
        modeOffset: getModeOffset(modeNumber),
        baseChroma,
        box: system === Systems.pentatonic
            ? boxDefinition.slice().map((x: string) => x.replace('4', '-').replace('7', '-'))
            : boxDefinition
    });    
}

// register default systems
registerSystem(Systems.pentatonic, ({box, modeNumber}: GetBoxInSystemParams) => CAGEDDefinition[getPentatonicBoxIndex(+box, modeNumber as number)])
registerSystem(Systems.CAGED, ({box}: GetBoxInSystemParams) => CAGEDDefinition[CAGED_ORDER.indexOf(`${box}`)])
registerSystem(Systems.TNPS, ({box}: GetBoxInSystemParams) => TNPSDefinition[+box - 1])
registerSystem(Systems.chord, ({box}: GetBoxInSystemParams) => ChordDefinition[CHORD_ORDER.indexOf(`${box}`)])
