"""Sintetiza los efectos de sonido del Estilo 1 (sin samples externos)."""
import numpy as np, wave, sys, os
SR=48000
out=sys.argv[1]; os.makedirs(out,exist_ok=True)
rng=np.random.default_rng(7)
def save(name,x,peak=0.5):
    x=x/ (np.max(np.abs(x))+1e-9)*peak
    s=np.repeat((x*32767).astype(np.int16)[:,None],2,axis=1)
    w=wave.open(os.path.join(out,name),"wb");w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(s.tobytes());w.close()
def t(d):return np.arange(int(SR*d))/SR
def lp(x,a):  # one-pole lowpass, a in (0,1)
    y=np.zeros_like(x);acc=0.0
    for i,v in enumerate(x):acc+=a*(v-acc);y[i]=acc
    return y
# whoosh: ruido filtrado con barrido y envolvente campana
d=0.45;tt=t(d);n=rng.standard_normal(len(tt))
cut=np.interp(tt,[0,d*0.6,d],[0.02,0.25,0.03]);y=np.zeros_like(n);acc=0
for i in range(len(n)):acc+=cut[i]*(n[i]-acc);y[i]=acc
env=np.sin(np.pi*tt/d)**2;save("whoosh.wav",y*env,0.45)
# pop: senoidal con caída de tono
d=0.09;tt=t(d);f=np.interp(tt,[0,d],[1100,520]);ph=2*np.pi*np.cumsum(f)/SR
save("pop.wav",np.sin(ph)*np.exp(-tt*45),0.45)
# boom: golpe grave suave
d=0.7;tt=t(d);f=np.interp(tt,[0,0.15,d],[90,52,45]);ph=2*np.pi*np.cumsum(f)/SR
x=np.sin(ph)*np.exp(-tt*6)+0.15*lp(rng.standard_normal(len(tt)),0.05)*np.exp(-tt*30)
save("boom.wav",x,0.6)
# tick
d=0.03;tt=t(d);save("tick.wav",np.sin(2*np.pi*2400*tt)*np.exp(-tt*220),0.35)
# check: dos tonos suaves
d=0.16;tt=t(d);x=np.sin(2*np.pi*880*tt)*(tt<0.07)+np.sin(2*np.pi*1320*tt)*(tt>=0.06)
save("check.wav",x*np.exp(-((tt%0.08))*30),0.3)
# flash: brillo que crece (ruido agudo)
d=0.35;tt=t(d);n=rng.standard_normal(len(tt));hp=n-lp(n,0.2)
save("flash.wav",hp*(tt/d)**2*np.exp(-np.maximum(tt-d*0.85,0)*80),0.35)
print("ok")
