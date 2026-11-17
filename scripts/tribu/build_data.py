"""Genera src/compositions/tribu/data.ts a partir de captions.json y faces.json."""
import json, re, sys, numpy as np
ROOT=sys.argv[1]
caps=json.load(open(f"{ROOT}/public/captions.json"))
faces=json.load(open(f"{ROOT}/scripts/tribu/faces.json"))
HOOK=(72.06,76.50); MAIN=(4.86,139.48)

# --- palabras con correcciones ---
W=[{"w":c["text"].strip(),"s":c["startMs"]/1000,"e":c["endMs"]/1000} for c in caps]
def fix(i,w):
    nxt=W[i+1]["w"] if i+1<len(W) else ""
    prv=W[i-1]["w"] if i>0 else ""
    if w["w"]=="el" and prv=="llega": w["w"]="al"
    if w["w"]=="tengan": w["w"]="tienen"
    return w
W=[fix(i,w) for i,w in enumerate(W)]
DROP={(33.86,"pues"),(112.12,"O"),(112.12,"sea,"),(75.02,"pero")}
W=[w for w in W if (round(w["s"],2),w["w"]) not in DROP]
# "¿no?" que el transcriptor omitió; "Pero" con mayúscula tras la pregunta
W.append({"w":"¿no?","s":74.62,"e":74.76}); W.append({"w":"Pero","s":74.98,"e":75.04})
W.sort(key=lambda w:w["s"])
for w in W:
    if w["w"]=="altruista,": w["w"]="altruista,"

KEY=["ecuador","nefróloga","programas","resultado","capacitan","científicos","empresariales","negocio","capacitación",
     "descuidado","científico","problema","estructura","financiera","vender","altruista","comemos","cobrar","correctamente",
     "importantísimo","números","facultad","creencia","consejo","principal","transforma","financieros","equipo","asistentes",
     "ayuda","sistemas","fácil","pacientes","importancia","siempre","servicio","consultorio","capacitarse","médico","salud","emprendedores","especialidades","negocio?"]
def norm(s):return re.sub(r"[^\wáéíóúñü]","",s.lower())
MAXC=19
def chunks(lo,hi):
    ws=[w for w in W if w["s"]>=lo-0.12 and w["s"]<hi-0.13]
    out=[];cur=[]
    def flush():
        if cur: out.append(list(cur)); cur.clear()
    for i,w in enumerate(ws):
        if cur:
            txt=" ".join(x["w"] for x in cur+[w])
            gap=w["s"]-cur[-1]["e"]
            if len(txt)>MAXC or gap>0.45 or (re.search(r"[.?!]$",cur[-1]["w"]) ) or (re.search(r",$",cur[-1]["w"]) and len(cur)>=3):
                flush()
        cur.append(w)
    flush()
    # no terminar una línea en palabra de enlace: pásala a la siguiente si cabe
    FN={"de","y","en","que","un","una","la","los","el","a","o","sino","porque","por","para","del","es","las","si","nos","al","le","lo","se","tu","mi","muy","ese","esa"}
    for k in range(len(out)-1):
        while len(out[k])>1 and norm(out[k][-1]["w"]) in FN and not re.search(r"[,.?]$",out[k][-1]["w"]) \
              and len(" ".join(x["w"] for x in [out[k][-1]]+out[k+1]))<=MAXC+2:
            out[k+1].insert(0,out[k].pop())
    # sin palabra suelta: une una palabra sola con la anterior si cabe
    res=[]
    for c in out:
        if len(c)==1 and res and not re.search(r"[.?!]$",res[-1][-1]["w"]) and len(" ".join(x["w"] for x in res[-1]+c))<=MAXC+3 and c[0]["s"]-res[-1][-1]["e"]<0.45:
            res[-1]+=c
        else: res.append(c)
    R=[]
    for k,c in enumerate(res):
        kw=-1
        for key in KEY:
            for j,x in enumerate(c):
                if norm(x["w"])==norm(key): kw=j;break
            if kw>=0:break
        end=c[-1]["e"]+0.25
        if k+1<len(res): end=min(max(end,res[k+1][0]["s"]) if res[k+1][0]["s"]-c[-1]["e"]<0.6 else end, res[k+1][0]["s"])
        R.append({"s":round(c[0]["s"],3),"e":round(min(end,hi),3),"words":[{"t":x["w"],"s":round(x["s"],3)} for x in c],"kw":kw})
    return R
hookSubs=chunks(*HOOK); mainSubs=chunks(*MAIN)

# --- caras ---
T=[];J=[];V=[]
for o in faces:
    fs=[f for f in o["f"] if f[2]>=75 and f[1]<560]
    j=[f for f in fs if f[0]+f[2]/2<345]; v=[f for f in fs if f[0]+f[2]/2>=345]
    T.append(o["t"])
    J.append([j[0][0]+j[0][2]/2,j[0][1]+j[0][3]/2,j[0][2]] if len(j)==1 else [np.nan]*3)
    V.append([v[0][0]+v[0][2]/2,v[0][1]+v[0][3]/2,v[0][2]] if len(v)==1 else [np.nan]*3)
T=np.array(T)
def track(A):
    A=np.array(A,float)
    for k in range(3):
        m=~np.isnan(A[:,k]);A[:,k]=np.interp(T,T[m],A[m,k])
    # mediana + media móvil (~1.2 s) para seguir sin temblor
    from numpy.lib.stride_tricks import sliding_window_view as sw
    P=np.pad(A,((3,3),(0,0)),mode="edge");A=np.median(sw(P,7,axis=0),axis=2)
    P=np.pad(A,((4,4),(0,0)),mode="edge");A=np.mean(sw(P,9,axis=0),axis=2)
    grid=np.arange(0,142.8,0.2)
    return [[round(float(np.interp(g,T,A[:,k]))*1.5,1) for k in range(3)] for g in grid]
FJ=track(J);FV=track(V)

ts=f"""// Archivo generado por scripts/tribu/build_data.py — no editar a mano.
export type SubWord = {{t: string; s: number}};
export type Sub = {{s: number; e: number; words: SubWord[]; kw: number}};
export const HOOK_SRC = {list(HOOK)} as const;
export const MAIN_SRC = {list(MAIN)} as const;
export const HOOK_SUBS: Sub[] = {json.dumps(hookSubs,ensure_ascii=False)};
export const MAIN_SUBS: Sub[] = {json.dumps(mainSubs,ensure_ascii=False)};
/** Caras (centro x, centro y, tamaño) en coordenadas 1080x1920, cada 0.2 s de tiempo original. */
export const FACE_STEP = 0.2;
export const FACE_J: number[][] = {json.dumps(FJ)};
export const FACE_V: number[][] = {json.dumps(FV)};
"""
open(f"{ROOT}/src/compositions/tribu/data.ts","w").write(ts)
for s in hookSubs+mainSubs:
    print(f'{s["s"]:7.2f}-{s["e"]:7.2f}', " ".join(("*"+w["t"]+"*") if i==s["kw"] else w["t"] for i,w in enumerate(s["words"])))
