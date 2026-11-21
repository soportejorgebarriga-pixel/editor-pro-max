import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Tiempo, TOTAL, FPS} from './Tiempo';

const Root: React.FC = () =>
  React.createElement(Composition, {id: 'tiempo', component: Tiempo, durationInFrames: TOTAL, fps: FPS, width: 1080, height: 1920});

registerRoot(Root);
