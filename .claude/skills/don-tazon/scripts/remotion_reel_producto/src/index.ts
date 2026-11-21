import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Reel5} from './Reel5';
import cues from './cues.json';

const Root: React.FC = () =>
  React.createElement(Composition, {
    id: 'reel5',
    component: Reel5,
    durationInFrames: cues.total,
    fps: 30,
    width: 1080,
    height: 1920,
  });

registerRoot(Root);
