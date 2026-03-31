import { useState, useEffect, useRef, useCallback } from "react";

const TEAL = "#2B7A78";
const MINT = "#5CDB95";
const TEAL_LIGHT = "#e8f5f3";
const SAGE = "#3aafa9";
const BG = "#f3f6f4";
const WHITE = "#ffffff";
const TEXT = "#1a2e2a";
const TEXT_SEC = "#5f7a76";
const CHAT_BG = "#f7faf9";
const BORDER = "#e0ebe8";
const USER_BUBBLE = "#2B7A78";
const ALERT_RED = "#e8453c";
const ALERT_GREEN = "#3aaf6a";
const MOBILE_BP = 768;
const LOGO_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAIAAAABc2X6AAABCGlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGA8wQAELAYMDLl5JUVB7k4KEZFRCuwPGBiBEAwSk4sLGHADoKpv1yBqL+viUYcLcKakFicD6Q9ArFIEtBxopAiQLZIOYWuA2EkQtg2IXV5SUAJkB4DYRSFBzkB2CpCtkY7ETkJiJxcUgdT3ANk2uTmlyQh3M/Ck5oUGA2kOIJZhKGYIYnBncAL5H6IkfxEDg8VXBgbmCQixpJkMDNtbGRgkbiHEVBYwMPC3MDBsO48QQ4RJQWJRIliIBYiZ0tIYGD4tZ2DgjWRgEL7AwMAVDQsIHG5TALvNnSEfCNMZchhSgSKeDHkMyQx6QJYRgwGDIYMZAKbWPz9HbOBQAAAbn0lEQVR42uV8a3ReZ3Xm3u/7nut30ae7ZMuyZPkSO07i2I5jJyFAAoSsAIGWcm2hBIbFMNBpO12r07Lmx6yumTW9ZJiyZrWF0pSGe0PIhQQIwRDiQHDiOHFujuNYsmTdpe+Tvuu5ve/e8+PIie1YjiTbnZnFt/RDy5J9znP2fvd+9vPsY7wz+g78Jn0E/IZ9fuMAq3+DazADM6ffI+LpP+KT3yIinP7D/w8Bp1CVQlspCUAABpgMMwAiSIECUAAwAAEbZq3ZEABz+gAuBv6LCJiIHVtYQhbLyXND9ZGRYHomrlR1HBMTSIWug5mMyudVS4vV3u60t6lCk5XxpQI0wJo4SZgvNHh1kQKLCFlXnZgI9/6sdPBQeW4uIQIhUIiFrGZm5teyXUp0XdmUV12d9po1Xt9ab02P29KiHCENcKxJ6wuDHC94WyJi2xZM8OCPZn788GytZnxfCoFJwlqfcmaBARAAAAERBAIgAAMRM7MQmMvK7m53/Tp/00a/r88r5CwEiImShJlBiP83ABOx58pSMfnHO0affaGayylErNeN5+KqVXZ3l2pplr6Pli2AQWsOQ67XqVI182VTrlCtRkFAZBglCgRm0IalgNYWa8P6zKVbshvW+50dtgAIYzLEQuD/TcAp2omJ6ItfOj45HefzVr1uLAuu2Z25Zk9mVZeyHRQIwJCGGeFkVE+Cr1RpajoZHo6Pj+ix8bhSJgawbQSAODZEkMupDQP+7qubtl2RzziyHhmA5dX2CwaYGBwLSyX9l38zOFNMsllZqZh1/c6HP1AYWGclCScJE531wC8cTiFASnAcRMQo4nLZDA4lz70QvPRyPDenhRC2DYgQhkQEvWvcm97edu2eJkCIIlp6qC8QYAZEYMa/+p+DR48F+Zwsl82eq/3f+0izZUEQkBCvFRsGAE5bDwgBUqIUgAjEYAxXq2RZ6PvCGHZdwQylOfPi4fDpZ4KR0WR+3kiJnivCiOKYL7s089EPda9Z7dVDvUTM8n3/5f0XIryccdS3vjfx6/3zzU1WuWKuuybzyY+3GMNJAlIuoE0jLCVYFrqusG00BsoVPTVjpmZMrUaZjKjV+Wtfnx9Y7+Rzot4grcF1cV2/s3OHt32b17PaCho8MaWFgGxWjo6Fjz9Rbm93Bnr9KKGlVPALEGEi9h354sv1v7p9yPNko0GbNjn/8bOtxjARvApVSnBdJIJqlUpzNDqWHB+OR8fiUskEIRsDSkE+K9etsw+/FAnBf/KHHc3NIkk47XNCgOehbYko4qefDe97oDw8kjTlpdYcReaTH+9565taakuI8wXowyhQE9z3g2lmMIbzOfF7Hy4AgDEgxELqZjKiEdD+J4ODB4Ph0WRuztTrBAQgwVKgZFqWoFKh4RNxoUk2Avr2XfOf/0xrAowIQkAY8fFhrRQ35eWOK90d29x77q/+8KGKZaHnyjvuHM3m1M5t+TfMbXXe4YWMK546VD38Ui2bVZWKee97mrs7VaVKUgIR2DZKib9+InjwR5WhwQgE5vOyo121b5YtraqQl5ms8BwEgEbApTk9Nq7Hx5Mwoqa8SOsZEWQz4tt3lfY+XMu3KM/F5oJY1+/s2Oa7XtOPHqoSsWXJf75ztGf1QGuLlWg+R2qfL2BEZoZHH5tLS+vaXvvaq/16g6QEZvB9nJkx3/j23MGDQdcq653vbNq43u7uVoWC8FyhFOLrupROYK5syhXT3an0yVtPNO+40h8f18WSCRpcLCYvvRj98MHK2n4nmxHzZWNZOD+v775n6rOf7o21RsCLApgZbFsMnQhffLHmeaJWo2v3+H4GajVABNvG51+M/v7Ls54nb/tEy86dfj67wDe05jAk5lfZVvrsABGZOZvB5oIVx0y88OdxzJdudjZtbJ+fN0FAlQoVS3p8Qh89Fk9OJloDImQy8smD5SNHaxvXZ8KYFgvyeQJmG+Wzz1UbgfF92dGudlzph+FrGVUs6Q9/oGXHDtf3RBRRrUbMjAIshZ4tlETABeINDEnCccK+L5k4CPlU8ogIUcSI0FwQzQWxpgeldBEhCHhsInnssfoTBwJpYRLz4/vnN2/IMvNiFVudXz6DZjg22FAKo4iv3OY0N4t6ndJ7jWO+/tqslBAEVK8TACgFriuJuFzmqelkYkKXShQn7DrY1ibXrrV6e62HH655Hu7Z7aUIT70WMxCB6whDHISkY/B8sWGdvWWjA1Da93jdsnBiMkn4XP3pvAALgfXQTE3HKeC1ayw8/XGkeZvi9z3RCOmXjzeeORSMjCaVCtUaCYdRmspgW+3NTn+f/cyzjSsuc6+7xmc+s/YIAVEEP/pJZWpSV6pUq+umvLr5nbm+Xnt4JLYsoRPKeEIg8uKY1fkcYKVwbj6p1bQQKCW0tVp0yjR08lgCMWcy4plD4T33l0fHEkR0bCQw2wc63rd9S2LMiVL5iaHRF0Znqi9oIXDbFd7r75YIslmx71f1u79fBkWInPXs0bFweDRas8oZHdeeJ8KQNm7yFVy0tiQENBomjgkRlcJcFl9lGqf1LV/ufaR+111lITGblczMjIrk2Fzlhi0De9b1A0A9iu5+6vk/v/vHtTDp77MXbS0MUpkbr+xr9TL3HTycy1q2kIdfDjK+ZAaJYngkNMAXRcRjBgSMIjKGAUApth1gOhOt74sDB8NvfWc+4LihQ62JCJhZCSzWgo98+buz9bomyjjOx67ZUXAzza3Y2aGS5EzAaa3eusUrFNQfv+PaY1MlAghi3dvW9Ik3X1EPEwBwHHHoUHVyJrZtwXwRVEsEMHohixERBfJpwQApoVqj7907x6i/8O43ff5tu6XA9PcNc5PvDc/M/+zFo0oIZj4xNzcyWxnoc1wHXz9XIYJOuLVN9K/NaAOX93YhgO9YTx4b27Vuze6BnloYWxZWavro0botBC+C+LxlWkylilSsOT0FCBwHXzkWT05G/3Dbu//re955+wfeVfBcTQsVBZkR8ODwePq8Xp6cqdaCgT7vHCOKrcDNmOly/W1bNmgy2lBHPnPL5Ztv3DIQx4kQAhhOjEUX6wwzgBSIJ3sGm9fXVZwva8e2PnL19v3HRj779XtKjdCSgpkRIDZERPNBmP7yz14clA6vH3DOwQ1RQE+X/wdff9CgzrquIUqIDNPla7pT0oeIlXLCix9jcT6hZQBlYdp1jOH4dQePDLS3WvVGeHB4LOPaB4fGBC7oHJqoqymb99ycYzNzqON7njy8+ZJMd5eK47MDRkStef2AlWj2bJuZHSWL85W7Dzy/pqUJFwYVNuZU/nZBU5qZHUdKhelslHKsVxNbCIhiGui3863im786tHV11/qutlBrgSiFqAbR+6+6dPBv/vS3d25FxAcOHT58YvLmG5sBabF6k/KtDeutW9/VXKsZgaCJpbLftnl9bEhgytvQz0i8SFYLEXgu2hYyAxHXGyROD40xkMmK997c/rVHngl18t/ff1Oj2tBEDNCc9f/uZ/sffPb53ev6Gkn0Z9/66fYducu3ukHA51AkESGKzK3vyn7od1qDkCuN6AvvvX7zqs65Rp0oDSt3dzoXx1tCYALHla4rU9JXrRoUZzbqet287S25TZfKG//ijuas/ye3vjljW/Uwmqs1upuyW7q7COgj//u7RV267Xc7Em2WcJSwVtc3vd371Cfaejq9+546cuvffv0vH3zUdyxt2HXFhg0ZDYtz6ZPVlc/8V99IDUQAYnYdkc3KYikBhNIcnfU3E20+84mOr/zL1E1/fce2np7rN63d2NX2lksGbrhkw+BM8cb/dseh6aH//Ec9uTyE4ZIEZyGwVjO7djqbL+l44Uj96ODo4YMRkETkJOGZmXh9n7fY/KAcZ0EDx5MzafoEDLExaQGAxTQEInBt0dSkiFgg1upnOX6IYAwIyX/477tHR5OHHpl78MDkr46MT5Qatz/w+M9ffmXTJeovvrA2l4cw5KXL60Jgo0G2BXt2ZK/fnS++k/7uK7PDIxETHHy6sueqwqJtaXAoCEOKYzKGiUEiKAsdVzTlVKFgZVwFAGFijGFERAF4suUyMxETCUuJdMSL47N3e0QggkZgurrlpz/eccvbkwcemn/o+MGBPu8//UHHJRvdODFLjO0Z54UZ6g0yxrS0yN1XZY6+EloWzhbjyCwq3Kr/8deDqdp2kjABIEiBroPNBWvtWu/yy3Jbt2TzGRUbTjQRsZBoWUIJQAAfpO8LYlZCBA02ZrGOsjAwRpFua5Wf/FgbU5ttYZxQIzDp3a+YzwOgTlLLBhEhjsks3smVlChlyntOisYIAJgQTEwnI6PRvsfm1vS4a9d6s8UkCLQxoBT6nszlVWuzGujPBAEJRERoBEafU09KNY04YY4ZEYIQLpAnzCig0SBmBkApcMGDPStg1AASQSK+qpUbpoQwMRLAcgVacnImHhkLpUAhEAUwABMQMREjzLqOcF2RJFxvUByDYwPxGzCW9EIX0P5lxpmiRgFEnMkpW4loEZVHeZ9YZ9lSWhIkEoABMppFYEQp4RONcLAazTSkxFxOMQMTUzp+ISAAWghSsEAGlgKDgIOAXFfyOeN86rx1QWAjYhzz5GSiJCaaOtpthRguVqX/afvbMyxdFAwQGjNH0YipvWSqh01lbEcda0nmWD389UzjeIUBvTWZ/J5OMKzLsa4luhQmpUiXY2ZAhVFE1Rq1tUmtl0RaHAdfFavOT4eA+XkzNa0tC+ME1vS45xoeblJdZx0l5pP4ubi0T00/dOXkic25zPPV8iPjjeNVq8VpvbVPtrjUSICBAm3KcfGB4fBEPTFQLhshrAVd7tw+oycHj8ek+Vzj/tIAWwqHT8TVqvE8dF3R3+frxSUeETPFTAlTwqSBNJABJuCCZb8p0/Xnhcv/NXvdJ9319vaW5s9sar6ue+7X0yduP9R4egYQTWRYor0u763PgyZiKM0b8Ub3bgz7nhifMLd/cfb+BytC4mKz6xKNHsvGw0ciIk4S7u50urud148xrwG2UdgoLBQWCgVCgZCQttuFT6ftf6Hl8n/NXNdn5/K39q6+7RKjefyOI5VHx6UnEZAa2mr3UCAzlEoG8A1c1WxWTE7RP3x1NgjMrqsyWRcR0xIISweekllmKBTkkaPxM4caGV/GMW3ZnMnaghYvm+re2siYqU+ZcJ7iOuuIKWHDAALQQemjKgirU3q73LY/zW39o+IT3rbWnk5v+q5j098bSqaDlnf3gUCrzROexKoplbQx5xTuLXzxpfjOb8yVSkZZYv+T9aY8DqxzslkBAFqz0WxOQ37mrJdaTZaFlsIw5r0/r917fyVZ6MNw1famZHFRGgDUH889ScAIKDD9K/CqT8HABMDMBCyqol06UgpdS1S72/2pS2a+f7z06ISej9o/tNFqd1XOElU9P09JsihDTIXOHzxYHR2Megaclmb5wovRCy9EfX3W+nVO/zp7dbdqbpa+J5Q6O59N/bog5Olp/fIr4f4ng8Gh2PUEMdsKP/7JNf39fhSbcwEuCPvUh/n6CWFh6AJosEZAlMiRASU6PrxO5ay5h8dMcHjVv9tsrcqI0UalZoKAPA+NOUvdSlP3hrdk+3qtt1yfaWtTh56LfvBA+dhQdGwodh5D3xO5nCg0yUKTzOWE7wmZtn0GYyCOuRFQuWLm583srKnVybYxmxHacFNeff4/9K7v9WuRPrdLrM4tap7mncNJjU4gGGaC1vesFZ6cvX946huv2B2ukFhvULVGmYxKp46zTvDbtzm7drpxxFFkrrzC3rih/cBT4eP76yMn4lqNajWanNSnEtJTw5t+ac3ZrGhpVlFMgBgEZuul7sbezFwjUerC+cN8RugZTKBb3rEGpZh9cNiesJUvo4DLZVq9CuIYFiPVUcSpNoKIjQYryW+93tt9tTs0pF86Eg4dj2aLpt5I55nXLooASoFji0xGbNxo96x2f/jjMgMYw0rh9de1RIakfOPmdh4iHgICmlpSeNtqYC7tHVOu1Ibm5rU45Zicg1qenHiwVichYNNGtWVzLkmy1RpXq6ZapUaDE81EjIi2BZmMyGZFe7tkFv/rSzO1mpEK44Q+dVvP9svz9cgsZcvj/PxhYrCFNOTaAohTp7c0ZxZs3+XogUQQBAzAiOB7kMsqsfr0vTsGbVgIiGL44pdmBocizxPA8PnPrN11Zb4Sarm0pZaVAmZgBplRWApn7jteOlj0+3Mp95qfM8viEczguigQGsECATEGjOFTdZhUM3Nd1EZ8+avFoaEom5VRaD732bW7rmgqB8lSknnlgJkYLGlbGD89M3Hv8bBuWm/tb97eOvHVwwimXDWLTcVnRes4+OSBgBiu2Z1hojgBY5jo1fab5jM6rhif0N/4dunwkTCfV+Vy8rHfXbVctMsHzMAAMmOJUjj3w+Hp/TPuxkLvbX12XxbqibCEQKhWKUmWuR0n8Zt3lvb9sv7WN2f7eq2mJul5CwyVGZKEZ4v6iQPBI4/WajVqyqtiMbnu2qabbmirhMtDu8wqTYy2tCTGB6Ym7x+OA2p7X3/TdV0gUNcSSyLaUiDXGxRF5LpoCHAJpzcMedcOr3d155e/WvzbL810rbI62lV7q8zlZDrWT03r0bGkUiHXFb4vi6X4sq25j3+0J0rMClZrFfDpfYfPxjyYWaDKWDBbLz0wUjww617a3POefme1bwID6UaYFGghAkYRRxF7nkj9xaVoNPU6tbXJP/vTjnvuqzy8tzozbZR10rRiQETbxpR7BoG55eb297+vU0rUK5qxFEtMWSUgYrpCiKcM6AyciliJCR4dnfrxWELQ9sGB/O4uQNB1jQIh3XtFEJZE5ETDOYaVxTBHEUsJH3x/09bNzsM/rw0OxWHIZECcXGcDgErFvOuW9t//nVWVWOuVTpTKCRKKDUUECYEm1gwmXT1BoQCVklmVlKKJh0fLR6uZK1q73r3W6vKpoQEYxelLGBIBgAwvZg6dGzMx1Otm82Zn0yZnfDwZGk5qVTNbol8/UbcsEQRm11X5D/5WVznS56OTqOHbnzUJMXG6TsOvvYaRWnwsBRoG9lTnR9fnr+pgAFNPUOCZhhUCSkQAIkj3iFbgNqPAIGBEWNVt9fbaQsDf/2PJEDgIRJzNKCUxSlayJv0a4Nxbe4QvpKfQlsIWoARKQEBmNhrAkCnHs/cPOx1efk8XNTQA4Ouvd4o6RQzacOotruC+0kkrjDij8P4Hqr/8Zb3QLLVhz5e/fLx0/ZuaN6zzw4hwpbKuyt+waqHbpK8f8KmKJgCD9FU8FRR/PNJ4vuhvaaFg8fAtdBIgc9ZJdjmqjQ2lOfrFvno2J1PBCBG0xp/uLW4ayDAwwgqDLKieUF1TQ1OoOTIc02tfEXFkdDXJ72qXOauyfwYYGM/ZpjF9biuXbBa4ly2ePNAozhuRmPyO9vy2tqSu/Yx8+lBl6ETDXXyF440BQ1pmBS48xleNpvRLIGiSbV7Trs76C6XoRE048ixKTPoUaPHBeplWe5zAoedDhYCOyO3uzO7skJZAhEZA+x6btxZf4VgC4CVcnxPK7+4QlqjsnxYSz3YtBGbWlGYaivMKr2Xh7KyZmNSSyd9YkC2O6nD8dXkTGM+TTz1dniknlrXCIC8FMHBsrE4vv7Ot9sxsMhMIS5wlhgycEKfv5MhTwr4S2RVGRpNa3UiJ7uqMUChydnZnOxuyLJydTZ45VHHkCoMslphkpDm/p4sTUz1YRFucJauJyXDKX5TEpbGsxYwiHBqKyDAqUdw7NvnVlyqPTri9WXd1xkQkFR54qqyJV/bK1tK4NALHxl6VyW5uqTwx03RdF0g8LcipO54wA0gBloUrLiqIGMcwOpYIYKdgkxLVZ0u150tefy4tDo4tjg0GoxPR6m57uZRuOSsPDAyQ292hi0H98JxwJJ+i/SIiJ2RCDYhS4ooBM4OUUK2amaKWhv1NTas+t7X9A+vs3mxwvBZOBsISqf3/3PNVe0Wla+mWO1JkvIG8uzpb2T/Fhk97Lyd9Sy4yDKAU2PbKzQSlsFgy1RpLhaLFBQX5a7pWfXpL+2/3W60OhQYALAsPPFUONePyKdcy6ikTg6vyu9rDY9VopIbOKSdZAEWaEk5fJHPSPokrizDOzOg4JmmharFZA9U1Ksxf293zucuy21t1oF1fvnKsse9XpawtDfHFAoyIHBv/shbpyepTM/jaMWYUghuGtGFA10XLBqIVFi1EmCka0ixdqQouE6UXMvUELGx+xxqZsygmx5Hfv3dqfCZyltmfltMxESgh1eJkL2utPVsy8zGoVCYHFGBqCRgm5owvLbXyosUMxZIGZuErkVFgFsp9agCoJrv5hh6KyLKxXDbf+s6EFMsTDJdHERCADeR2tFMtbrw0L17NagRTjZmAGXJZoVYKGBG0hkqFkNnKO8JVQKfXkUDnr27PXNqsGzqbkweervxkbzHrqKUn9nI3Z5BiY/dm3dXZ6sEZ0OlECQioq0kan1xu5dNbugpUqRoBIAs2qDOLHzOgQGEhGTaGM768+/tTLw83fOdcjuF5AAYAYnREdltrMFSNp0K0BTAAsS7HqSKTz4sVJ7OUUKuZ+QpJAapgnzGWsWGZtRrPzFaeLnodnlQCAWLNX/uXsTBiIZbktooVRIET9i9tRoDGS3Oo0l1aNtUYBCJCIS9XPDtIiXPzFDRIKpRNNvBrsxkTi4zSI9WZ+4dRYueHBjpuWKUb2suIwaHgu3dP5m3rtP814sIBBk7IavfcNdnac0WODSBwpHVNA6IU0NR0GidZXoQFzs3rJGGhUOXs13qbYeEpnmpMf+uVeC5qv7lX9mTdXR1NWwpxTeea1CO/KH3j++OOLd8wzmJFd8Yg0d/cHJ2oJdOBanMlMTU0IdgW5vPS0Ao1JxQwP09kWFhCZBQQAyATi6xF4/XJO4/Wx4OW67tzb+o2DW0AW29Za3vKROR66t77p7/yTyck4qkrzBcGMDCAQLvFAYbZ7w2WfzJaf7ZoEmJG1xPZrDirV7rET7lqgAEtga4kTYygslZ8uDT+tSONsXrL7vaWd62l2KBAiA22ex2/1ScFmtgUmu1f7Jv7+rfHXVtcUKuFWLiS5qLS3lGVVcwwfdcgWkLlFBHnssL3BNEKNVRmaDQImIWNVt4C34JGUn14dObhUUqo7S2rCrf0Ep18ZVGgCbSztbWn2Z345tGoHBearZ/+rNjf799w3aLvEi/bakFHcjWZ+ubRaDzo+sC6zO7OaLg6t3csGqoQYXNB2jZE0QpTmgnCkIVC3aDi94Zkzqq/UmmM1Nwuv/XG1d7OdorMqVIZCjSBFqszq35/0/g/H0nqieepu++ZvHRztlBQZ9WuxfLQStSz4cSdRxqDlfZ39GT3dJpAe5sKdqfHmgmgpUVKuXLWwQxGp4URys+XivsmOaGum9f0fHqzt6vdhPr1wiAKpIbGbr/15jVs2LKxVNK/2FdaTCH4P3/2uxmkpeSpAAAAAElFTkSuQmCC";


function useIsMobile() {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= MOBILE_BP : true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = () => setIsMobile(window.innerWidth <= MOBILE_BP);
    h(); // Run once on mount to sync with actual window size
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return isMobile;
}

// Chat options component for interactive selections
  function ChatOptions({ options, multiSelect, onSelect, disabled }) {
    const [selected, setSelected] = useState(multiSelect ? [] : null);
    const GREEN = "#5CDB95";
    
    const handleClick = (option) => {
      if (disabled) return;
      if (multiSelect) {
        setSelected(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]);
      } else {
        setSelected(option);
        onSelect(option);
      }
    };
    
    const handleConfirm = () => {
      if (selected.length > 0) {
        onSelect(selected);
      }
    };
    
    return (
      <div style={{ marginTop: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => handleClick(opt)}
              disabled={disabled}
              style={{
                padding: "8px 14px", borderRadius: 20,
                background: (multiSelect ? selected.includes(opt) : selected === opt) ? GREEN : WHITE,
                border: `1px solid ${(multiSelect ? selected.includes(opt) : selected === opt) ? GREEN : BORDER}`,
                color: (multiSelect ? selected.includes(opt) : selected === opt) ? WHITE : TEXT,
                fontSize: 13, fontWeight: 500, cursor: disabled ? "default" : "pointer",
                opacity: disabled ? 0.5 : 1,
                transition: "all 0.15s ease"
              }}
            >
              {opt}
            </button>
          ))}
        </div>
        {multiSelect && !disabled && selected.length > 0 && (
          <button
            onClick={handleConfirm}
            style={{
              marginTop: 10, padding: "8px 16px", borderRadius: 20, border: "none",
              background: GREEN, color: WHITE, fontSize: 13, fontWeight: 600, cursor: "pointer"
            }}
          >
            Continue
          </button>
        )}
      </div>
    );
  }

  // Simple markdown-like formatter for AI responses
  function FormattedText({ text, color = TEXT_SEC }) {
  if (!text) return null;
  
  // Split into paragraphs first
  const paragraphs = text.split(/\n\n+/);
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {paragraphs.map((paragraph, pIdx) => {
        // Check if this paragraph is a list (lines starting with - or *)
        const lines = paragraph.split('\n');
        const isList = lines.every(line => line.trim() === '' || /^[\-\*•]\s/.test(line.trim()));
        
        if (isList) {
          const listItems = lines.filter(line => /^[\-\*•]\s/.test(line.trim()));
          return (
            <ul key={pIdx} style={{ 
              margin: 0, 
              paddingLeft: 20, 
              display: "flex", 
              flexDirection: "column", 
              gap: 8 
            }}>
              {listItems.map((item, idx) => {
                const content = item.replace(/^[\-\*•]\s*/, '').trim();
                return (
                  <li key={idx} style={{ 
                    color, 
                    fontSize: 14, 
                    lineHeight: 1.6,
                    paddingLeft: 4
                  }}>
                    <FormatInline text={content} color={color} />
                  </li>
                );
              })}
            </ul>
          );
        }
        
        // Check if it's a numbered list
        const isNumberedList = lines.every(line => line.trim() === '' || /^\d+[\.\)]\s/.test(line.trim()));
        if (isNumberedList) {
          const listItems = lines.filter(line => /^\d+[\.\)]\s/.test(line.trim()));
          return (
            <ol key={pIdx} style={{ 
              margin: 0, 
              paddingLeft: 20, 
              display: "flex", 
              flexDirection: "column", 
              gap: 8 
            }}>
              {listItems.map((item, idx) => {
                const content = item.replace(/^\d+[\.\)]\s*/, '').trim();
                return (
                  <li key={idx} style={{ 
                    color, 
                    fontSize: 14, 
                    lineHeight: 1.6,
                    paddingLeft: 4
                  }}>
                    <FormatInline text={content} color={color} />
                  </li>
                );
              })}
            </ol>
          );
        }
        
        // Regular paragraph - handle line breaks within
        return (
          <p key={pIdx} style={{ margin: 0, color, fontSize: 14, lineHeight: 1.6 }}>
            {lines.map((line, lIdx) => (
              <span key={lIdx}>
                {lIdx > 0 && <br />}
                <FormatInline text={line} color={color} />
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

// Format inline elements like **bold** and *italic*
function FormatInline({ text, color }) {
  if (!text) return null;
  
  // Process bold (**text**) and italic (*text*)
  const parts = [];
  let remaining = text;
  let key = 0;
  
  while (remaining.length > 0) {
    // Check for bold first
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    if (boldMatch && boldMatch.index === 0) {
      parts.push(
        <strong key={key++} style={{ fontWeight: 600, color: TEXT }}>
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }
    
    // Find next special pattern
    const nextBold = remaining.indexOf('**');
    
    if (nextBold === -1) {
      // No more patterns, add rest as text
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
    
    // Add text before the pattern
    if (nextBold > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, nextBold)}</span>);
      remaining = remaining.slice(nextBold);
    }
    
    // Process the bold pattern
    const endBold = remaining.indexOf('**', 2);
    if (endBold > 2) {
      parts.push(
        <strong key={key++} style={{ fontWeight: 600, color: TEXT }}>
          {remaining.slice(2, endBold)}
        </strong>
      );
      remaining = remaining.slice(endBold + 2);
    } else {
      // Unclosed bold, treat as text
      parts.push(<span key={key++}>{remaining.slice(0, 2)}</span>);
      remaining = remaining.slice(2);
    }
  }
  
  return <>{parts}</>;
}

function NavIcon({ icon, size = 20 }) {
  const s = { width: size, height: size, strokeWidth: 1.6, stroke: "currentColor", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    grid: <svg {...s} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
    users: <svg {...s} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    "file-text": <svg {...s} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    layers: <svg {...s} viewBox="0 0 24 24"><polygon points="12,2 2,7 12,12 22,7"/><polyline points="2,17 12,22 22,17"/><polyline points="2,12 12,17 22,12"/></svg>,
    settings: <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    paperclip: <svg {...s} viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.49"/></svg>,
    smile: <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
    message: <svg {...s} viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    more: <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
    chevron: <svg {...s} viewBox="0 0 24 24" style={{...s, width: 16, height: 16}}><polyline points="9,18 15,12 9,6"/></svg>,
    "chevron-down": <svg {...s} viewBox="0 0 24 24" style={{...s, width: 14, height: 14}}><polyline points="6,9 12,15 18,9"/></svg>,
    "chevron-left": <svg {...s} viewBox="0 0 24 24" style={{...s, width: 18, height: 18}}><polyline points="15,18 9,12 15,6"/></svg>,
    menu: <svg {...s} viewBox="0 0 24 24" style={{...s, width: 18, height: 18}}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    x: <svg {...s} viewBox="0 0 24 24" style={{...s, width: 18, height: 18}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    calendar: <svg {...s} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    inbox: <svg {...s} viewBox="0 0 24 24"><polyline points="22,12 16,12 14,15 10,15 8,12 2,12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>,
    canvas: <svg {...s} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
    send: <svg {...s} viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>,
    file: <svg {...s} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>,
    chart: <svg {...s} viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  };
  return icons[icon] || null;
}

const dataConnectors = {
  watch: {
    bg: "#2B7A78", color: "#fff", name: "Watch",
    icon: (s) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"><rect x="3.5" y="1" width="7" height="12" rx="2.5"/><circle cx="7" cy="6.5" r="2" /><line x1="7" y1="5.5" x2="8.2" y2="6.5"/></svg>
  },
  scale: {
    bg: "#45818e", color: "#fff", name: "Scale",
    icon: (s) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"><rect x="1.5" y="3.5" width="11" height="8" rx="2"/><circle cx="7" cy="7.5" r="2"/><line x1="7" y1="6.2" x2="8.4" y2="7.2"/></svg>
  },
  cgm: {
    bg: "#7bc67e", color: "#fff", name: "CGM",
    icon: (s) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="1,7 3.5,7 5,4 7,10 9,5.5 10.5,7 13,7"/></svg>
  },
  milton: {
    bg: "#3aafa9", color: "#fff", name: "Milton",
    icon: (s) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"><text x="4" y="10.5" fill="#fff" stroke="none" fontSize="9" fontWeight="700" fontFamily="DM Sans, sans-serif">M</text></svg>
  },
  foodlog: {
    bg: "#ef6c3e", color: "#fff", name: "Food Log",
    icon: (s) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"><path d="M4.5 2v4c0 1.4 1.1 2.5 2.5 2.5S9.5 7.4 9.5 6V2"/><line x1="7" y1="8.5" x2="7" y2="12"/><line x1="5" y1="12" x2="9" y2="12"/></svg>
  },
  sleep: {
    bg: "#8e7cc3", color: "#fff", name: "Sleep",
    icon: (s) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"><path d="M11 8A5 5 0 116 3a3.5 3.5 0 005 5z"/></svg>
  },
  bloodwork: {
    bg: "#e06666", color: "#fff", name: "Bloodwork",
    icon: (s) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"><path d="M7 2C7 2 3.5 6 3.5 8.5a3.5 3.5 0 007 0C10.5 6 7 2 7 2z"/></svg>
  },
};

const initialClients = [
  {
    name: "Sarah Chen",
    alert: "Session Today",
    alertType: "blue",
    program: "Fat Loss — Phase 2",
    startDate: "Feb 1",
    assessment: {
      date: "2026-02-01",
      bodyweight: 158,
      bodyFat: 28.5,
      leanMass: 113,
      measurements: { waist: 32, hips: 38, chest: 36 },
      strengthBaselines: {
        squat: { weight: 95, reps: 8 },
        deadlift: { weight: 115, reps: 6 },
        benchPress: { weight: 65, reps: 8 },
        overheadPress: { weight: 45, reps: 8 },
      },
      movementScreen: { score: 14, notes: "Limited ankle dorsiflexion, tight hip flexors" },
    },
    current: {
      bodyweight: 153,
      bodyFat: 25.2,
      leanMass: 114.5,
      measurements: { waist: 30.5, hips: 37, chest: 36 },
    },
    goals: {
      primary: "Lose 20 lbs",
      targetWeight: 138,
      targetBodyFat: 22,
      secondaryGoals: ["Squat 135 lbs", "Run a 5K"],
      targetDate: "2026-08-01",
    },
    sessions: [
      {
        date: "2026-03-21",
        type: "Lower Body",
        duration: 55,
        exercises: [
          { name: "Barbell Back Squat", sets: [{ set: 1, weight: 115, reps: 8, rpe: 7 }, { set: 2, weight: 115, reps: 8, rpe: 7.5 }, { set: 3, weight: 120, reps: 6, rpe: 8 }] },
          { name: "Romanian Deadlift", sets: [{ set: 1, weight: 95, reps: 10, rpe: 7 }, { set: 2, weight: 95, reps: 10, rpe: 7.5 }, { set: 3, weight: 100, reps: 8, rpe: 8 }] },
          { name: "Leg Press", sets: [{ set: 1, weight: 180, reps: 12, rpe: 6 }, { set: 2, weight: 200, reps: 10, rpe: 7 }, { set: 3, weight: 200, reps: 10, rpe: 7.5 }] },
          { name: "Walking Lunges", sets: [{ set: 1, weight: 20, reps: 12, rpe: 7 }, { set: 2, weight: 20, reps: 12, rpe: 7.5 }] },
        ],
        notes: "Felt strong today. Squat depth improving. Bumped weight on set 3.",
      },
      {
        date: "2026-03-19",
        type: "Upper Body Push",
        duration: 50,
        exercises: [
          { name: "Bench Press", sets: [{ set: 1, weight: 70, reps: 8, rpe: 7 }, { set: 2, weight: 70, reps: 8, rpe: 7.5 }, { set: 3, weight: 75, reps: 6, rpe: 8 }] },
          { name: "Incline Dumbbell Press", sets: [{ set: 1, weight: 25, reps: 10, rpe: 7 }, { set: 2, weight: 25, reps: 10, rpe: 7 }] },
          { name: "Overhead Press", sets: [{ set: 1, weight: 50, reps: 8, rpe: 7.5 }, { set: 2, weight: 50, reps: 7, rpe: 8 }] },
          { name: "Tricep Pushdowns", sets: [{ set: 1, weight: 30, reps: 12, rpe: 6 }, { set: 2, weight: 35, reps: 10, rpe: 7 }] },
        ],
        notes: "OHP felt heavy. May need to hold at 50 for another week.",
      },
      {
        date: "2026-03-17",
        type: "Upper Body Pull",
        duration: 50,
        exercises: [
          { name: "Lat Pulldown", sets: [{ set: 1, weight: 80, reps: 10, rpe: 7 }, { set: 2, weight: 85, reps: 8, rpe: 7.5 }] },
          { name: "Seated Cable Row", sets: [{ set: 1, weight: 70, reps: 10, rpe: 7 }, { set: 2, weight: 75, reps: 10, rpe: 7.5 }] },
          { name: "Face Pulls", sets: [{ set: 1, weight: 25, reps: 15, rpe: 6 }, { set: 2, weight: 25, reps: 15, rpe: 6.5 }] },
          { name: "Dumbbell Bicep Curls", sets: [{ set: 1, weight: 15, reps: 12, rpe: 7 }, { set: 2, weight: 15, reps: 10, rpe: 7.5 }] },
        ],
        notes: "Good session. Back felt engaged throughout.",
      },
      {
        date: "2026-03-14",
        type: "Lower Body",
        duration: 55,
        exercises: [
          { name: "Barbell Back Squat", sets: [{ set: 1, weight: 110, reps: 8, rpe: 7 }, { set: 2, weight: 110, reps: 8, rpe: 7.5 }, { set: 3, weight: 115, reps: 6, rpe: 8 }] },
          { name: "Romanian Deadlift", sets: [{ set: 1, weight: 90, reps: 10, rpe: 7 }, { set: 2, weight: 95, reps: 8, rpe: 7.5 }] },
          { name: "Leg Press", sets: [{ set: 1, weight: 180, reps: 12, rpe: 6.5 }, { set: 2, weight: 180, reps: 12, rpe: 7 }] },
        ],
        notes: "Squat felt smoother than last week.",
      },
      {
        date: "2026-03-12",
        type: "Upper Body Push",
        duration: 48,
        exercises: [
          { name: "Bench Press", sets: [{ set: 1, weight: 65, reps: 8, rpe: 7 }, { set: 2, weight: 70, reps: 6, rpe: 8 }] },
          { name: "Overhead Press", sets: [{ set: 1, weight: 45, reps: 8, rpe: 7 }, { set: 2, weight: 50, reps: 6, rpe: 8 }] },
        ],
        notes: "Short session due to time constraints.",
      },
    ],
    sessionsPerWeek: 3,
    sessionsThisWeek: 2,
    totalSessions: 14,
    streak: { current: 6, best: 9, unit: "sessions" },
    nutrition: { tracking: true, proteinAvg: 95, proteinTarget: 120, calorieAvg: 1650, calorieTarget: 1800 },
    insight: "Sarah's squat has progressed from 95 to 120 lbs in 6 weeks. Bench is stalling — may need to adjust volume. Next session: Upper Body Pull.",
    coachAngle: "Test 1RM on squat next week to update training max. Consider adding an extra pressing accessory.",
    narrative: "Squat up 25 lbs since assessment. Body comp improving — down 5 lbs, gained 1.5 lbs lean mass.",
    attendanceRate: 85,
    weightData: [158, 157, 156, 155, 154, 153.5, 153],
  },
  {
    name: "Marcus Johnson",
    alert: "Assessment Due",
    alertType: "red",
    program: "Muscle Gain — Hypertrophy",
    startDate: "Jan 15",
    assessment: {
      date: "2026-01-15",
      bodyweight: 175,
      bodyFat: 18,
      leanMass: 143.5,
      measurements: { waist: 33, hips: 38, chest: 42 },
      strengthBaselines: {
        squat: { weight: 185, reps: 5 },
        deadlift: { weight: 225, reps: 5 },
        benchPress: { weight: 155, reps: 5 },
        overheadPress: { weight: 95, reps: 5 },
      },
      movementScreen: { score: 16, notes: "Good mobility overall, slight shoulder internal rotation limitation" },
    },
    current: {
      bodyweight: 182,
      bodyFat: 17.5,
      leanMass: 150,
      measurements: { waist: 33.5, hips: 39, chest: 44 },
    },
    goals: {
      primary: "Gain 15 lbs muscle",
      targetWeight: 195,
      targetBodyFat: 16,
      secondaryGoals: ["Bench 225 lbs", "Deadlift 315 lbs"],
      targetDate: "2026-07-01",
    },
    sessions: [
      {
        date: "2026-03-20",
        type: "Push",
        duration: 65,
        exercises: [
          { name: "Bench Press", sets: [{ set: 1, weight: 175, reps: 5, rpe: 7 }, { set: 2, weight: 175, reps: 5, rpe: 7.5 }, { set: 3, weight: 180, reps: 4, rpe: 8.5 }] },
          { name: "Incline Dumbbell Press", sets: [{ set: 1, weight: 60, reps: 10, rpe: 7 }, { set: 2, weight: 60, reps: 9, rpe: 7.5 }, { set: 3, weight: 60, reps: 8, rpe: 8 }] },
          { name: "Overhead Press", sets: [{ set: 1, weight: 115, reps: 6, rpe: 7.5 }, { set: 2, weight: 115, reps: 5, rpe: 8 }] },
          { name: "Cable Flyes", sets: [{ set: 1, weight: 35, reps: 12, rpe: 7 }, { set: 2, weight: 35, reps: 12, rpe: 7 }] },
          { name: "Lateral Raises", sets: [{ set: 1, weight: 20, reps: 15, rpe: 7 }, { set: 2, weight: 20, reps: 12, rpe: 8 }] },
        ],
        notes: "Bench PR attempt next week. Feeling strong.",
      },
      {
        date: "2026-03-18",
        type: "Pull",
        duration: 60,
        exercises: [
          { name: "Barbell Deadlift", sets: [{ set: 1, weight: 275, reps: 5, rpe: 7.5 }, { set: 2, weight: 285, reps: 3, rpe: 8.5 }] },
          { name: "Barbell Row", sets: [{ set: 1, weight: 155, reps: 8, rpe: 7 }, { set: 2, weight: 155, reps: 8, rpe: 7.5 }] },
          { name: "Lat Pulldown", sets: [{ set: 1, weight: 140, reps: 10, rpe: 7 }, { set: 2, weight: 140, reps: 9, rpe: 7.5 }] },
          { name: "Face Pulls", sets: [{ set: 1, weight: 40, reps: 15, rpe: 6.5 }, { set: 2, weight: 40, reps: 15, rpe: 7 }] },
        ],
        notes: "Deadlift moving well. Ready to test 300.",
      },
      {
        date: "2026-03-16",
        type: "Legs",
        duration: 70,
        exercises: [
          { name: "Barbell Back Squat", sets: [{ set: 1, weight: 225, reps: 5, rpe: 7 }, { set: 2, weight: 235, reps: 4, rpe: 8 }, { set: 3, weight: 225, reps: 5, rpe: 7.5 }] },
          { name: "Romanian Deadlift", sets: [{ set: 1, weight: 185, reps: 8, rpe: 7 }, { set: 2, weight: 185, reps: 8, rpe: 7.5 }] },
          { name: "Leg Press", sets: [{ set: 1, weight: 360, reps: 12, rpe: 7 }, { set: 2, weight: 380, reps: 10, rpe: 8 }] },
          { name: "Leg Curls", sets: [{ set: 1, weight: 90, reps: 12, rpe: 7 }, { set: 2, weight: 90, reps: 10, rpe: 7.5 }] },
        ],
        notes: "Squat depth is on point. Legs are growing.",
      },
      {
        date: "2026-03-13",
        type: "Push",
        duration: 60,
        exercises: [
          { name: "Bench Press", sets: [{ set: 1, weight: 170, reps: 6, rpe: 7 }, { set: 2, weight: 175, reps: 5, rpe: 7.5 }] },
          { name: "Overhead Press", sets: [{ set: 1, weight: 110, reps: 6, rpe: 7 }, { set: 2, weight: 115, reps: 5, rpe: 8 }] },
        ],
        notes: "Solid session.",
      },
    ],
    sessionsPerWeek: 5,
    sessionsThisWeek: 4,
    totalSessions: 32,
    streak: { current: 18, best: 18, unit: "sessions" },
    nutrition: { tracking: true, proteinAvg: 185, proteinTarget: 180, calorieAvg: 3200, calorieTarget: 3100 },
    insight: "Marcus has been training for 8 weeks since his last assessment. Strength is up across all lifts. Time to reassess and update training maxes.",
    coachAngle: "Schedule InBody scan this week. Current lifts suggest he's ready for a new training block.",
    narrative: "Bench up 20 lbs, deadlift up 50 lbs since assessment. Gained 7 lbs bodyweight with minimal fat gain.",
    attendanceRate: 96,
    weightData: [175, 176, 177, 178, 179, 180, 181, 182],
  },
  {
    name: "Emily Rodriguez",
    alert: "Needs Programming",
    alertType: "red",
    program: "General Fitness",
    startDate: "Feb 15",
    assessment: {
      date: "2026-02-15",
      bodyweight: 145,
      bodyFat: 32,
      leanMass: 98.6,
      measurements: { waist: 30, hips: 40, chest: 35 },
      strengthBaselines: {
        squat: { weight: 65, reps: 8 },
        deadlift: { weight: 75, reps: 8 },
        benchPress: { weight: 45, reps: 8 },
        overheadPress: { weight: 25, reps: 8 },
      },
      movementScreen: { score: 12, notes: "Tight hip flexors, limited thoracic extension" },
    },
    current: {
      bodyweight: 143,
      bodyFat: 30.5,
      leanMass: 99.4,
      measurements: { waist: 29, hips: 39.5, chest: 35 },
    },
    goals: {
      primary: "Lose 25 lbs and feel confident",
      targetWeight: 125,
      targetBodyFat: 24,
      secondaryGoals: ["Complete a full push-up", "Touch toes"],
      targetDate: "2026-09-01",
    },
    sessions: [
      {
        date: "2026-03-10",
        type: "Full Body",
        duration: 45,
        exercises: [
          { name: "Goblet Squat", sets: [{ set: 1, weight: 25, reps: 10, rpe: 7 }, { set: 2, weight: 25, reps: 10, rpe: 7.5 }] },
          { name: "Dumbbell Row", sets: [{ set: 1, weight: 20, reps: 10, rpe: 6.5 }, { set: 2, weight: 20, reps: 10, rpe: 7 }] },
          { name: "Push-ups (Incline)", sets: [{ set: 1, weight: 0, reps: 8, rpe: 7 }, { set: 2, weight: 0, reps: 6, rpe: 8 }] },
        ],
        notes: "Good energy today. Push-ups are improving!",
      },
      {
        date: "2026-03-07",
        type: "Full Body",
        duration: 40,
        exercises: [
          { name: "Goblet Squat", sets: [{ set: 1, weight: 20, reps: 10, rpe: 6.5 }, { set: 2, weight: 25, reps: 8, rpe: 7.5 }] },
          { name: "Lat Pulldown", sets: [{ set: 1, weight: 50, reps: 10, rpe: 7 }, { set: 2, weight: 50, reps: 10, rpe: 7 }] },
        ],
        notes: "Shorter session. Felt tired but pushed through.",
      },
    ],
    sessionsPerWeek: 3,
    sessionsThisWeek: 0,
    totalSessions: 8,
    streak: { current: 0, best: 4, unit: "sessions" },
    nutrition: { tracking: false, proteinAvg: 68, proteinTarget: 100, calorieAvg: 1400, calorieTarget: 1600 },
    insight: "Emily missed the last 2 sessions. She was making good progress but attendance has dropped. Her current program ends this week.",
    coachAngle: "Check in with Emily. She may be overwhelmed. Design a simpler 2x/week program to restart momentum.",
    narrative: "Down 2 lbs but missed last 2 weeks. Needs a check-in and fresh programming.",
    attendanceRate: 45,
    weightData: [145, 144.5, 144, 143.5, 143, 143, 143],
  },
  {
    name: "David Park",
    alert: "Session Today",
    alertType: "blue",
    program: "Powerlifting Prep",
    startDate: "Jan 5",
    assessment: {
      date: "2026-01-05",
      bodyweight: 198,
      bodyFat: 22,
      leanMass: 154.4,
      measurements: { waist: 36, hips: 40, chest: 44 },
      strengthBaselines: {
        squat: { weight: 275, reps: 3 },
        deadlift: { weight: 315, reps: 3 },
        benchPress: { weight: 185, reps: 3 },
        overheadPress: { weight: 115, reps: 5 },
      },
      movementScreen: { score: 15, notes: "Good overall. Slight knee valgus under heavy loads." },
    },
    current: {
      bodyweight: 195,
      bodyFat: 20,
      leanMass: 156,
      measurements: { waist: 35, hips: 40, chest: 45 },
    },
    goals: {
      primary: "Compete in first powerlifting meet",
      targetWeight: 198,
      targetBodyFat: 18,
      secondaryGoals: ["Squat 315", "Deadlift 405", "Bench 225"],
      targetDate: "2026-06-15",
    },
    sessions: [
      {
        date: "2026-03-21",
        type: "Squat Day",
        duration: 75,
        exercises: [
          { name: "Barbell Back Squat", sets: [{ set: 1, weight: 245, reps: 3, rpe: 6 }, { set: 2, weight: 275, reps: 3, rpe: 7 }, { set: 3, weight: 295, reps: 2, rpe: 8 }, { set: 4, weight: 285, reps: 3, rpe: 7.5 }] },
          { name: "Pause Squat", sets: [{ set: 1, weight: 225, reps: 3, rpe: 7 }, { set: 2, weight: 225, reps: 3, rpe: 7.5 }] },
          { name: "Leg Press", sets: [{ set: 1, weight: 400, reps: 10, rpe: 7 }, { set: 2, weight: 400, reps: 10, rpe: 7.5 }] },
        ],
        notes: "295 moved well. 315 is within reach in 4-6 weeks.",
      },
      {
        date: "2026-03-19",
        type: "Bench Day",
        duration: 65,
        exercises: [
          { name: "Bench Press", sets: [{ set: 1, weight: 185, reps: 3, rpe: 6.5 }, { set: 2, weight: 195, reps: 3, rpe: 7.5 }, { set: 3, weight: 205, reps: 2, rpe: 8.5 }] },
          { name: "Close Grip Bench", sets: [{ set: 1, weight: 155, reps: 6, rpe: 7 }, { set: 2, weight: 155, reps: 6, rpe: 7.5 }] },
          { name: "Dumbbell Incline Press", sets: [{ set: 1, weight: 65, reps: 8, rpe: 7 }, { set: 2, weight: 65, reps: 7, rpe: 7.5 }] },
        ],
        notes: "205 is a PR! 225 by meet day looking good.",
      },
      {
        date: "2026-03-17",
        type: "Deadlift Day",
        duration: 70,
        exercises: [
          { name: "Conventional Deadlift", sets: [{ set: 1, weight: 315, reps: 3, rpe: 6.5 }, { set: 2, weight: 345, reps: 2, rpe: 7.5 }, { set: 3, weight: 365, reps: 1, rpe: 8 }] },
          { name: "Deficit Deadlift", sets: [{ set: 1, weight: 275, reps: 4, rpe: 7 }, { set: 2, weight: 275, reps: 4, rpe: 7.5 }] },
          { name: "Barbell Row", sets: [{ set: 1, weight: 155, reps: 8, rpe: 7 }, { set: 2, weight: 155, reps: 8, rpe: 7 }] },
        ],
        notes: "365 single felt smooth. 405 attempt in 3 weeks.",
      },
      {
        date: "2026-03-14",
        type: "Squat Day",
        duration: 70,
        exercises: [
          { name: "Barbell Back Squat", sets: [{ set: 1, weight: 245, reps: 3, rpe: 6.5 }, { set: 2, weight: 265, reps: 3, rpe: 7 }, { set: 3, weight: 285, reps: 2, rpe: 8 }] },
        ],
        notes: "Good session. Volume day next week.",
      },
    ],
    sessionsPerWeek: 4,
    sessionsThisWeek: 3,
    totalSessions: 28,
    streak: { current: 12, best: 14, unit: "sessions" },
    nutrition: { tracking: true, proteinAvg: 200, proteinTarget: 190, calorieAvg: 2800, calorieTarget: 2700 },
    insight: "David is 12 weeks out from his first meet. All lifts are progressing well. Squat close to 315, deadlift to 405, bench to 225.",
    coachAngle: "Start peaking protocol in 4 weeks. Consider a mock meet to practice commands.",
    narrative: "All three lifts trending toward meet goals. Down 3 lbs while getting stronger.",
    attendanceRate: 95,
    weightData: [198, 197.5, 197, 196, 195.5, 195, 195],
  },
  {
    name: "Rachel Kim",
    alert: "On Track",
    alertType: "green",
    program: "Post-Pregnancy Recovery",
    startDate: "Mar 1",
    assessment: {
      date: "2026-03-01",
      bodyweight: 165,
      bodyFat: 35,
      leanMass: 107.3,
      measurements: { waist: 35, hips: 42, chest: 37 },
      strengthBaselines: {
        squat: { weight: 45, reps: 10 },
        deadlift: { weight: 55, reps: 10 },
        benchPress: { weight: 35, reps: 10 },
        overheadPress: { weight: 20, reps: 10 },
      },
      movementScreen: { score: 11, notes: "Core stability needs work. Diastasis recti present but improving." },
    },
    current: {
      bodyweight: 162,
      bodyFat: 33.5,
      leanMass: 107.7,
      measurements: { waist: 34, hips: 41.5, chest: 37 },
    },
    goals: {
      primary: "Return to pre-pregnancy fitness",
      targetWeight: 145,
      targetBodyFat: 26,
      secondaryGoals: ["Rebuild core strength", "Regain energy"],
      targetDate: "2026-09-01",
    },
    sessions: [
      {
        date: "2026-03-22",
        type: "Full Body",
        duration: 35,
        exercises: [
          { name: "Goblet Squat", sets: [{ set: 1, weight: 20, reps: 10, rpe: 6 }, { set: 2, weight: 20, reps: 10, rpe: 6.5 }] },
          { name: "Dead Bug", sets: [{ set: 1, weight: 0, reps: 10, rpe: 6 }, { set: 2, weight: 0, reps: 10, rpe: 6 }] },
          { name: "Band Pull-Apart", sets: [{ set: 1, weight: 0, reps: 15, rpe: 5 }, { set: 2, weight: 0, reps: 15, rpe: 5.5 }] },
          { name: "Glute Bridge", sets: [{ set: 1, weight: 0, reps: 12, rpe: 5.5 }, { set: 2, weight: 0, reps: 12, rpe: 6 }] },
        ],
        notes: "Feeling more confident. Core exercises getting easier.",
      },
      {
        date: "2026-03-19",
        type: "Full Body",
        duration: 30,
        exercises: [
          { name: "Bodyweight Squat", sets: [{ set: 1, weight: 0, reps: 12, rpe: 5.5 }, { set: 2, weight: 0, reps: 12, rpe: 6 }] },
          { name: "Modified Push-up", sets: [{ set: 1, weight: 0, reps: 8, rpe: 6.5 }, { set: 2, weight: 0, reps: 6, rpe: 7 }] },
          { name: "Bird Dog", sets: [{ set: 1, weight: 0, reps: 8, rpe: 5 }, { set: 2, weight: 0, reps: 8, rpe: 5.5 }] },
        ],
        notes: "Great energy today despite interrupted sleep.",
      },
      {
        date: "2026-03-15",
        type: "Full Body",
        duration: 30,
        exercises: [
          { name: "Goblet Squat", sets: [{ set: 1, weight: 15, reps: 10, rpe: 6 }, { set: 2, weight: 15, reps: 10, rpe: 6.5 }] },
          { name: "Dead Bug", sets: [{ set: 1, weight: 0, reps: 8, rpe: 6 }, { set: 2, weight: 0, reps: 8, rpe: 6.5 }] },
        ],
        notes: "First week back. Taking it slow.",
      },
    ],
    sessionsPerWeek: 2,
    sessionsThisWeek: 2,
    totalSessions: 6,
    streak: { current: 6, best: 6, unit: "sessions" },
    nutrition: { tracking: false, proteinAvg: 85, proteinTarget: 110, calorieAvg: 1900, calorieTarget: 1800 },
    insight: "Rachel has completed all 6 scheduled sessions since starting. Core stability improving. Ready to add light resistance.",
    coachAngle: "Progress to goblet squats with 25 lbs. Continue core focus. Celebrate the consistency win!",
    narrative: "Perfect attendance for 3 weeks! Down 3 lbs, core strength returning.",
    attendanceRate: 92,
    weightData: [165, 164.5, 164, 163, 162.5, 162, 162],
  },
  {
    name: "Aaron Smith",
    alert: "On Track",
    alertType: "green",
    program: "Strength Building",
    startDate: "Feb 12",
    assessment: {
      date: "2026-02-12",
      bodyweight: 185,
      bodyFat: 24,
      leanMass: 140.6,
      measurements: { waist: 34, hips: 39, chest: 41 },
      strengthBaselines: {
        squat: { weight: 155, reps: 5 },
        deadlift: { weight: 185, reps: 5 },
        benchPress: { weight: 135, reps: 5 },
        overheadPress: { weight: 75, reps: 5 },
      },
      movementScreen: { score: 14, notes: "Decent mobility. Hip hinge pattern needs reinforcement." },
    },
    current: {
      bodyweight: 183,
      bodyFat: 22.5,
      leanMass: 141.8,
      measurements: { waist: 33.5, hips: 39, chest: 41.5 },
    },
    goals: {
      primary: "Get stronger and leaner",
      targetWeight: 180,
      targetBodyFat: 18,
      secondaryGoals: ["Squat 225", "Visible abs"],
      targetDate: "2026-07-01",
    },
    sessions: [
      {
        date: "2026-03-21",
        type: "Upper Body",
        duration: 55,
        exercises: [
          { name: "Bench Press", sets: [{ set: 1, weight: 155, reps: 5, rpe: 7 }, { set: 2, weight: 155, reps: 5, rpe: 7.5 }, { set: 3, weight: 160, reps: 4, rpe: 8 }] },
          { name: "Barbell Row", sets: [{ set: 1, weight: 135, reps: 8, rpe: 7 }, { set: 2, weight: 135, reps: 8, rpe: 7.5 }] },
          { name: "Overhead Press", sets: [{ set: 1, weight: 85, reps: 6, rpe: 7 }, { set: 2, weight: 85, reps: 5, rpe: 8 }] },
          { name: "Dumbbell Curl", sets: [{ set: 1, weight: 25, reps: 10, rpe: 7 }, { set: 2, weight: 25, reps: 10, rpe: 7 }] },
        ],
        notes: "Bench is moving well. Ready to test 165 next week.",
      },
      {
        date: "2026-03-18",
        type: "Lower Body",
        duration: 60,
        exercises: [
          { name: "Barbell Back Squat", sets: [{ set: 1, weight: 175, reps: 5, rpe: 7 }, { set: 2, weight: 185, reps: 4, rpe: 8 }, { set: 3, weight: 175, reps: 5, rpe: 7.5 }] },
          { name: "Romanian Deadlift", sets: [{ set: 1, weight: 155, reps: 8, rpe: 7 }, { set: 2, weight: 155, reps: 8, rpe: 7.5 }] },
          { name: "Leg Press", sets: [{ set: 1, weight: 270, reps: 10, rpe: 7 }, { set: 2, weight: 270, reps: 10, rpe: 7.5 }] },
        ],
        notes: "Squat depth is finally consistent. 185 felt solid.",
      },
      {
        date: "2026-03-14",
        type: "Upper Body",
        duration: 50,
        exercises: [
          { name: "Bench Press", sets: [{ set: 1, weight: 150, reps: 5, rpe: 7 }, { set: 2, weight: 155, reps: 4, rpe: 8 }] },
          { name: "Lat Pulldown", sets: [{ set: 1, weight: 100, reps: 10, rpe: 7 }, { set: 2, weight: 100, reps: 10, rpe: 7 }] },
        ],
        notes: "Good session. Focused on form.",
      },
      {
        date: "2026-03-11",
        type: "Lower Body",
        duration: 55,
        exercises: [
          { name: "Barbell Back Squat", sets: [{ set: 1, weight: 165, reps: 5, rpe: 7 }, { set: 2, weight: 175, reps: 5, rpe: 7.5 }] },
          { name: "Deadlift", sets: [{ set: 1, weight: 205, reps: 5, rpe: 7.5 }, { set: 2, weight: 205, reps: 5, rpe: 8 }] },
        ],
        notes: "Deadlift form is dialed in.",
      },
    ],
    sessionsPerWeek: 3,
    sessionsThisWeek: 2,
    totalSessions: 15,
    streak: { current: 8, best: 10, unit: "sessions" },
    nutrition: { tracking: true, proteinAvg: 165, proteinTarget: 160, calorieAvg: 2400, calorieTarget: 2300 },
    insight: "Aaron is making steady progress. Squat up 20 lbs, bench up 20 lbs since starting. Body comp improving.",
    coachAngle: "Continue current programming. Add one session of direct core work per week.",
    narrative: "Consistent gains across all lifts. Down 2 lbs while getting stronger.",
    attendanceRate: 88,
    weightData: [185, 184.5, 184, 183.5, 183.5, 183, 183],
  },
  {
    name: "Lisa Martinez",
    alert: "Session Today",
    alertType: "blue",
    program: "Olympic Lifting Intro",
    startDate: "Jan 8",
    assessment: {
      date: "2026-01-08",
      bodyweight: 142,
      bodyFat: 25,
      leanMass: 106.5,
      measurements: { waist: 28, hips: 37, chest: 34 },
      strengthBaselines: {
        squat: { weight: 115, reps: 5 },
        deadlift: { weight: 135, reps: 5 },
        benchPress: { weight: 75, reps: 5 },
        overheadPress: { weight: 55, reps: 5 },
      },
      movementScreen: { score: 17, notes: "Excellent mobility. Athletic background in volleyball." },
    },
    current: {
      bodyweight: 145,
      bodyFat: 23,
      leanMass: 111.7,
      measurements: { waist: 27.5, hips: 37.5, chest: 35 },
    },
    goals: {
      primary: "Learn Olympic lifts",
      targetWeight: 148,
      targetBodyFat: 22,
      secondaryGoals: ["Clean 100 lbs", "Snatch 75 lbs"],
      targetDate: "2026-06-01",
    },
    sessions: [
      {
        date: "2026-03-22",
        type: "Olympic Technique",
        duration: 60,
        exercises: [
          { name: "Hang Clean", sets: [{ set: 1, weight: 75, reps: 3, rpe: 7 }, { set: 2, weight: 80, reps: 3, rpe: 7.5 }, { set: 3, weight: 85, reps: 2, rpe: 8 }] },
          { name: "Front Squat", sets: [{ set: 1, weight: 95, reps: 5, rpe: 6.5 }, { set: 2, weight: 105, reps: 4, rpe: 7.5 }] },
          { name: "Snatch Grip Deadlift", sets: [{ set: 1, weight: 95, reps: 5, rpe: 7 }, { set: 2, weight: 95, reps: 5, rpe: 7 }] },
          { name: "Overhead Squat", sets: [{ set: 1, weight: 45, reps: 5, rpe: 6 }, { set: 2, weight: 55, reps: 5, rpe: 7 }] },
        ],
        notes: "Clean technique is improving. Third pull needs more speed.",
      },
      {
        date: "2026-03-20",
        type: "Strength",
        duration: 55,
        exercises: [
          { name: "Barbell Back Squat", sets: [{ set: 1, weight: 135, reps: 5, rpe: 7 }, { set: 2, weight: 145, reps: 3, rpe: 8 }] },
          { name: "Push Press", sets: [{ set: 1, weight: 65, reps: 5, rpe: 6.5 }, { set: 2, weight: 70, reps: 5, rpe: 7 }] },
          { name: "Romanian Deadlift", sets: [{ set: 1, weight: 115, reps: 8, rpe: 7 }, { set: 2, weight: 115, reps: 8, rpe: 7.5 }] },
        ],
        notes: "Squat PR! 145 for 3 is huge progress.",
      },
      {
        date: "2026-03-17",
        type: "Olympic Technique",
        duration: 55,
        exercises: [
          { name: "Power Snatch", sets: [{ set: 1, weight: 55, reps: 3, rpe: 7 }, { set: 2, weight: 60, reps: 2, rpe: 8 }] },
          { name: "Hang Clean", sets: [{ set: 1, weight: 70, reps: 3, rpe: 7 }, { set: 2, weight: 75, reps: 3, rpe: 7.5 }] },
        ],
        notes: "Snatch is clicking. Keep drilling position.",
      },
      {
        date: "2026-03-13",
        type: "Strength",
        duration: 50,
        exercises: [
          { name: "Front Squat", sets: [{ set: 1, weight: 95, reps: 5, rpe: 7 }, { set: 2, weight: 100, reps: 4, rpe: 7.5 }] },
          { name: "Deadlift", sets: [{ set: 1, weight: 155, reps: 5, rpe: 7 }, { set: 2, weight: 165, reps: 3, rpe: 8 }] },
        ],
        notes: "Deadlift PR! Posterior chain getting stronger.",
      },
    ],
    sessionsPerWeek: 4,
    sessionsThisWeek: 3,
    totalSessions: 28,
    streak: { current: 14, best: 16, unit: "sessions" },
    nutrition: { tracking: true, proteinAvg: 132, proteinTarget: 130, calorieAvg: 2100, calorieTarget: 2000 },
    insight: "Lisa is a natural! Clean at 85 lbs and climbing. Her volleyball background gives her great explosive power.",
    coachAngle: "Focus on pull timing for the clean. Ready to start full lifts from the floor.",
    narrative: "Clean up 30 lbs since learning. Squat up 30 lbs. Added 3 lbs of muscle.",
    attendanceRate: 94,
    weightData: [142, 143, 143.5, 144, 144.5, 145, 145],
  },
  {
    name: "Jason Williams",
    alert: "On Track",
    alertType: "green",
    program: "Maintenance — Active Lifestyle",
    startDate: "Dec 1",
    assessment: {
      date: "2025-12-01",
      bodyweight: 175,
      bodyFat: 18,
      leanMass: 143.5,
      measurements: { waist: 32, hips: 38, chest: 42 },
      strengthBaselines: {
        squat: { weight: 225, reps: 5 },
        deadlift: { weight: 275, reps: 5 },
        benchPress: { weight: 185, reps: 5 },
        overheadPress: { weight: 115, reps: 5 },
      },
      movementScreen: { score: 16, notes: "Well-balanced. Maintain current mobility." },
    },
    current: {
      bodyweight: 176,
      bodyFat: 17.5,
      leanMass: 145.2,
      measurements: { waist: 32, hips: 38, chest: 42.5 },
    },
    goals: {
      primary: "Maintain strength while staying lean",
      targetWeight: 175,
      targetBodyFat: 17,
      secondaryGoals: ["Train for hiking trip", "Stay injury-free"],
      targetDate: "2026-12-01",
    },
    sessions: [
      {
        date: "2026-03-20",
        type: "Full Body",
        duration: 50,
        exercises: [
          { name: "Barbell Back Squat", sets: [{ set: 1, weight: 205, reps: 5, rpe: 6.5 }, { set: 2, weight: 205, reps: 5, rpe: 7 }] },
          { name: "Bench Press", sets: [{ set: 1, weight: 165, reps: 5, rpe: 6.5 }, { set: 2, weight: 165, reps: 5, rpe: 7 }] },
          { name: "Barbell Row", sets: [{ set: 1, weight: 135, reps: 8, rpe: 6.5 }, { set: 2, weight: 135, reps: 8, rpe: 7 }] },
        ],
        notes: "Maintenance session. Felt good, no need to push harder.",
      },
      {
        date: "2026-03-17",
        type: "Full Body",
        duration: 45,
        exercises: [
          { name: "Deadlift", sets: [{ set: 1, weight: 255, reps: 5, rpe: 6.5 }, { set: 2, weight: 255, reps: 5, rpe: 7 }] },
          { name: "Overhead Press", sets: [{ set: 1, weight: 105, reps: 5, rpe: 6.5 }, { set: 2, weight: 105, reps: 5, rpe: 7 }] },
          { name: "Pull-ups", sets: [{ set: 1, weight: 0, reps: 10, rpe: 6 }, { set: 2, weight: 0, reps: 10, rpe: 6.5 }] },
        ],
        notes: "Easy day. Prioritizing recovery for weekend hike.",
      },
      {
        date: "2026-03-13",
        type: "Full Body",
        duration: 50,
        exercises: [
          { name: "Barbell Back Squat", sets: [{ set: 1, weight: 215, reps: 5, rpe: 7 }, { set: 2, weight: 215, reps: 5, rpe: 7.5 }] },
          { name: "Bench Press", sets: [{ set: 1, weight: 175, reps: 5, rpe: 7 }, { set: 2, weight: 175, reps: 4, rpe: 8 }] },
        ],
        notes: "Solid session. Strength is holding well.",
      },
    ],
    sessionsPerWeek: 2,
    sessionsThisWeek: 2,
    totalSessions: 24,
    streak: { current: 10, best: 14, unit: "sessions" },
    nutrition: { tracking: false, proteinAvg: 155, proteinTarget: 150, calorieAvg: 2600, calorieTarget: 2500 },
    insight: "Jason is maintaining beautifully. Strength stable, body comp slightly improved. Training supports his active lifestyle.",
    coachAngle: "Continue current approach. No changes needed. Check in monthly.",
    narrative: "Maintaining strength on 2x/week while staying active. Goal achieved.",
    attendanceRate: 85,
    weightData: [175, 175, 176, 175.5, 176, 176, 176],
  },
  {
    name: "Daniel Torres",
    alert: "Needs Programming",
    alertType: "red",
    program: "Fat Loss — Phase 1",
    startDate: "Feb 20",
    assessment: {
      date: "2026-02-20",
      bodyweight: 245,
      bodyFat: 35,
      leanMass: 159.3,
      measurements: { waist: 42, hips: 44, chest: 46 },
      strengthBaselines: {
        squat: { weight: 135, reps: 8 },
        deadlift: { weight: 155, reps: 8 },
        benchPress: { weight: 135, reps: 8 },
        overheadPress: { weight: 75, reps: 8 },
      },
      movementScreen: { score: 11, notes: "Limited hip mobility. Knee discomfort in deep squat." },
    },
    current: {
      bodyweight: 238,
      bodyFat: 33,
      leanMass: 159.5,
      measurements: { waist: 41, hips: 43.5, chest: 45.5 },
    },
    goals: {
      primary: "Lose 50 lbs",
      targetWeight: 195,
      targetBodyFat: 22,
      secondaryGoals: ["Get off blood pressure medication", "Play with kids without getting winded"],
      targetDate: "2026-10-01",
    },
    sessions: [
      {
        date: "2026-03-15",
        type: "Full Body",
        duration: 40,
        exercises: [
          { name: "Goblet Squat to Box", sets: [{ set: 1, weight: 35, reps: 10, rpe: 7 }, { set: 2, weight: 35, reps: 10, rpe: 7.5 }] },
          { name: "Lat Pulldown", sets: [{ set: 1, weight: 100, reps: 10, rpe: 7 }, { set: 2, weight: 100, reps: 10, rpe: 7 }] },
          { name: "Dumbbell Bench Press", sets: [{ set: 1, weight: 40, reps: 10, rpe: 7 }, { set: 2, weight: 40, reps: 10, rpe: 7.5 }] },
        ],
        notes: "Good session. Breathing better during sets.",
      },
      {
        date: "2026-03-12",
        type: "Full Body",
        duration: 35,
        exercises: [
          { name: "Leg Press", sets: [{ set: 1, weight: 180, reps: 12, rpe: 7 }, { set: 2, weight: 180, reps: 12, rpe: 7.5 }] },
          { name: "Seated Row", sets: [{ set: 1, weight: 90, reps: 10, rpe: 7 }, { set: 2, weight: 90, reps: 10, rpe: 7 }] },
        ],
        notes: "Shorter session. Work stress affecting energy.",
      },
      {
        date: "2026-03-08",
        type: "Full Body",
        duration: 40,
        exercises: [
          { name: "Goblet Squat to Box", sets: [{ set: 1, weight: 30, reps: 10, rpe: 6.5 }, { set: 2, weight: 35, reps: 8, rpe: 7.5 }] },
          { name: "Chest Press Machine", sets: [{ set: 1, weight: 80, reps: 10, rpe: 7 }, { set: 2, weight: 80, reps: 10, rpe: 7 }] },
        ],
        notes: "Progress on goblet squat! Hip feels better.",
      },
    ],
    sessionsPerWeek: 3,
    sessionsThisWeek: 0,
    totalSessions: 9,
    streak: { current: 0, best: 5, unit: "sessions" },
    nutrition: { tracking: true, proteinAvg: 140, proteinTarget: 180, calorieAvg: 2200, calorieTarget: 2000 },
    insight: "Daniel made great progress initially but hasn't trained in a week. Down 7 lbs which is excellent. Needs re-activation.",
    coachAngle: "Reach out with encouragement. Suggest a quick 20-minute session to restart momentum. His health goals are important.",
    narrative: "Down 7 lbs in 4 weeks but missed last week. Work stress cited. Needs support.",
    attendanceRate: 55,
    weightData: [245, 243, 241, 240, 239, 238, 238],
  },
  {
    name: "Amanda Foster",
    alert: "On Track",
    alertType: "green",
    program: "Rehab — Shoulder Recovery",
    startDate: "Jan 15",
    assessment: {
      date: "2026-01-15",
      bodyweight: 155,
      bodyFat: 28,
      leanMass: 111.6,
      measurements: { waist: 30, hips: 38, chest: 36 },
      strengthBaselines: {
        squat: { weight: 95, reps: 8 },
        deadlift: { weight: 115, reps: 8 },
        benchPress: { weight: 45, reps: 8 },
        overheadPress: { weight: 20, reps: 8 },
      },
      movementScreen: { score: 10, notes: "Right shoulder impingement. Limited overhead mobility. Post-surgery 6 months." },
    },
    current: {
      bodyweight: 153,
      bodyFat: 26.5,
      leanMass: 112.5,
      measurements: { waist: 29.5, hips: 37.5, chest: 36 },
    },
    goals: {
      primary: "Full shoulder recovery",
      targetWeight: 150,
      targetBodyFat: 24,
      secondaryGoals: ["Press overhead pain-free", "Return to swimming"],
      targetDate: "2026-05-01",
    },
    sessions: [
      {
        date: "2026-03-21",
        type: "Upper Body Rehab",
        duration: 45,
        exercises: [
          { name: "Cable External Rotation", sets: [{ set: 1, weight: 10, reps: 15, rpe: 5 }, { set: 2, weight: 10, reps: 15, rpe: 5 }] },
          { name: "Face Pulls", sets: [{ set: 1, weight: 20, reps: 15, rpe: 5.5 }, { set: 2, weight: 20, reps: 15, rpe: 5.5 }] },
          { name: "Landmine Press", sets: [{ set: 1, weight: 25, reps: 10, rpe: 6 }, { set: 2, weight: 25, reps: 10, rpe: 6.5 }] },
          { name: "Dumbbell Row", sets: [{ set: 1, weight: 25, reps: 10, rpe: 6 }, { set: 2, weight: 25, reps: 10, rpe: 6 }] },
        ],
        notes: "Shoulder feels great. Landmine press is pain-free now!",
      },
      {
        date: "2026-03-18",
        type: "Lower Body",
        duration: 50,
        exercises: [
          { name: "Barbell Back Squat", sets: [{ set: 1, weight: 105, reps: 8, rpe: 6.5 }, { set: 2, weight: 115, reps: 6, rpe: 7.5 }] },
          { name: "Romanian Deadlift", sets: [{ set: 1, weight: 95, reps: 10, rpe: 7 }, { set: 2, weight: 95, reps: 10, rpe: 7 }] },
          { name: "Leg Press", sets: [{ set: 1, weight: 180, reps: 12, rpe: 6.5 }, { set: 2, weight: 180, reps: 12, rpe: 7 }] },
        ],
        notes: "Lower body getting stronger. Compensating well for limited upper work.",
      },
      {
        date: "2026-03-14",
        type: "Upper Body Rehab",
        duration: 40,
        exercises: [
          { name: "Band Pull-Aparts", sets: [{ set: 1, weight: 0, reps: 20, rpe: 5 }, { set: 2, weight: 0, reps: 20, rpe: 5 }] },
          { name: "Cable External Rotation", sets: [{ set: 1, weight: 7.5, reps: 15, rpe: 5 }, { set: 2, weight: 10, reps: 12, rpe: 5.5 }] },
          { name: "Incline Dumbbell Press", sets: [{ set: 1, weight: 15, reps: 12, rpe: 6 }, { set: 2, weight: 15, reps: 12, rpe: 6.5 }] },
        ],
        notes: "Incline press pain-free for first time!",
      },
      {
        date: "2026-03-11",
        type: "Lower Body",
        duration: 45,
        exercises: [
          { name: "Goblet Squat", sets: [{ set: 1, weight: 35, reps: 10, rpe: 6 }, { set: 2, weight: 40, reps: 10, rpe: 7 }] },
          { name: "Hip Thrust", sets: [{ set: 1, weight: 95, reps: 12, rpe: 6.5 }, { set: 2, weight: 95, reps: 12, rpe: 7 }] },
        ],
        notes: "Good session. Ready to progress to barbell squat.",
      },
    ],
    sessionsPerWeek: 3,
    sessionsThisWeek: 2,
    totalSessions: 22,
    streak: { current: 11, best: 12, unit: "sessions" },
    nutrition: { tracking: true, proteinAvg: 115, proteinTarget: 120, calorieAvg: 1700, calorieTarget: 1650 },
    insight: "Amanda's shoulder is recovering beautifully. Landmine and incline press are now pain-free. Ready to test light overhead work.",
    coachAngle: "Introduce light dumbbell overhead press next session. Continue external rotation work. Swimming trial in 2 weeks.",
    narrative: "Shoulder ROM improved 40%. Pain-free on most pressing. On track for full recovery.",
    attendanceRate: 90,
    weightData: [155, 154.5, 154, 153.5, 153.5, 153, 153],
  },
  {
    name: "Michael Brown",
    alert: "Session Today",
    alertType: "blue",
    program: "Athletic Performance",
    startDate: "Feb 1",
    assessment: {
      date: "2026-02-01",
      bodyweight: 195,
      bodyFat: 20,
      leanMass: 156,
      measurements: { waist: 34, hips: 40, chest: 44 },
      strengthBaselines: {
        squat: { weight: 205, reps: 5 },
        deadlift: { weight: 245, reps: 5 },
        benchPress: { weight: 165, reps: 5 },
        overheadPress: { weight: 95, reps: 5 },
      },
      movementScreen: { score: 15, notes: "Good overall. Former college basketball player. Some knee stiffness." },
    },
    current: {
      bodyweight: 193,
      bodyFat: 18.5,
      leanMass: 157.3,
      measurements: { waist: 33.5, hips: 40, chest: 44.5 },
    },
    goals: {
      primary: "Improve vertical jump and court speed",
      targetWeight: 190,
      targetBodyFat: 16,
      secondaryGoals: ["Add 4 inches to vertical", "Faster 40 time"],
      targetDate: "2026-06-01",
    },
    sessions: [
      {
        date: "2026-03-22",
        type: "Power",
        duration: 55,
        exercises: [
          { name: "Box Jump", sets: [{ set: 1, weight: 0, reps: 5, rpe: 6 }, { set: 2, weight: 0, reps: 5, rpe: 6 }, { set: 3, weight: 0, reps: 5, rpe: 6.5 }] },
          { name: "Trap Bar Deadlift", sets: [{ set: 1, weight: 245, reps: 3, rpe: 7 }, { set: 2, weight: 265, reps: 3, rpe: 7.5 }, { set: 3, weight: 275, reps: 2, rpe: 8 }] },
          { name: "Split Squat Jump", sets: [{ set: 1, weight: 0, reps: 6, rpe: 7 }, { set: 2, weight: 0, reps: 6, rpe: 7 }] },
        ],
        notes: "Box jump height increased to 32 inches!",
      },
      {
        date: "2026-03-19",
        type: "Strength",
        duration: 60,
        exercises: [
          { name: "Barbell Back Squat", sets: [{ set: 1, weight: 225, reps: 5, rpe: 7 }, { set: 2, weight: 235, reps: 4, rpe: 8 }] },
          { name: "Bulgarian Split Squat", sets: [{ set: 1, weight: 40, reps: 8, rpe: 7 }, { set: 2, weight: 40, reps: 8, rpe: 7.5 }] },
          { name: "Nordic Curl", sets: [{ set: 1, weight: 0, reps: 6, rpe: 8 }, { set: 2, weight: 0, reps: 5, rpe: 8.5 }] },
        ],
        notes: "Squat is moving well. Single leg work is paying off.",
      },
      {
        date: "2026-03-15",
        type: "Power",
        duration: 50,
        exercises: [
          { name: "Depth Jump", sets: [{ set: 1, weight: 0, reps: 4, rpe: 7 }, { set: 2, weight: 0, reps: 4, rpe: 7 }] },
          { name: "Hang Clean", sets: [{ set: 1, weight: 135, reps: 3, rpe: 7 }, { set: 2, weight: 145, reps: 2, rpe: 8 }] },
        ],
        notes: "Plyos feeling explosive. Clean technique improving.",
      },
      {
        date: "2026-03-12",
        type: "Strength",
        duration: 55,
        exercises: [
          { name: "Trap Bar Deadlift", sets: [{ set: 1, weight: 255, reps: 5, rpe: 7 }, { set: 2, weight: 265, reps: 3, rpe: 8 }] },
          { name: "Front Squat", sets: [{ set: 1, weight: 155, reps: 5, rpe: 7 }, { set: 2, weight: 165, reps: 4, rpe: 7.5 }] },
        ],
        notes: "Trap bar moving well. Legs feeling powerful.",
      },
    ],
    sessionsPerWeek: 4,
    sessionsThisWeek: 3,
    totalSessions: 20,
    streak: { current: 10, best: 12, unit: "sessions" },
    nutrition: { tracking: false, proteinAvg: 175, proteinTarget: 170, calorieAvg: 2700, calorieTarget: 2600 },
    insight: "Michael's vertical has improved 2 inches. Power output is up. Body comp is improving while maintaining strength.",
    coachAngle: "Add reactive agility drills. Test vertical jump next week to measure progress.",
    narrative: "Vertical up 2 inches. Down 2 lbs while getting more explosive.",
    attendanceRate: 88,
    weightData: [195, 194.5, 194, 193.5, 193.5, 193, 193],
  },
  {
    name: "Jennifer Lee",
    alert: "On Track",
    alertType: "green",
    program: "Bodybuilding — Prep",
    startDate: "Mar 1",
    assessment: {
      date: "2026-03-01",
      bodyweight: 138,
      bodyFat: 22,
      leanMass: 107.6,
      measurements: { waist: 27, hips: 37, chest: 34 },
      strengthBaselines: {
        squat: { weight: 135, reps: 8 },
        deadlift: { weight: 165, reps: 6 },
        benchPress: { weight: 85, reps: 8 },
        overheadPress: { weight: 55, reps: 8 },
      },
      movementScreen: { score: 16, notes: "Good mobility. Previous figure competition experience." },
    },
    current: {
      bodyweight: 136,
      bodyFat: 21,
      leanMass: 107.4,
      measurements: { waist: 26.5, hips: 36.5, chest: 34 },
    },
    goals: {
      primary: "Compete in bikini division",
      targetWeight: 125,
      targetBodyFat: 14,
      secondaryGoals: ["Build glutes", "Improve shoulder caps"],
      targetDate: "2026-07-15",
    },
    sessions: [
      {
        date: "2026-03-21",
        type: "Glutes & Hamstrings",
        duration: 60,
        exercises: [
          { name: "Hip Thrust", sets: [{ set: 1, weight: 155, reps: 10, rpe: 7 }, { set: 2, weight: 165, reps: 8, rpe: 8 }, { set: 3, weight: 155, reps: 10, rpe: 7.5 }] },
          { name: "Romanian Deadlift", sets: [{ set: 1, weight: 115, reps: 10, rpe: 7 }, { set: 2, weight: 115, reps: 10, rpe: 7.5 }] },
          { name: "Cable Kickbacks", sets: [{ set: 1, weight: 20, reps: 15, rpe: 7 }, { set: 2, weight: 20, reps: 15, rpe: 7 }] },
          { name: "Leg Curl", sets: [{ set: 1, weight: 50, reps: 12, rpe: 7 }, { set: 2, weight: 50, reps: 12, rpe: 7.5 }] },
        ],
        notes: "Hip thrust PR! Glute development is visible.",
      },
      {
        date: "2026-03-19",
        type: "Shoulders & Arms",
        duration: 55,
        exercises: [
          { name: "Lateral Raises", sets: [{ set: 1, weight: 12, reps: 15, rpe: 7 }, { set: 2, weight: 12, reps: 15, rpe: 7.5 }, { set: 3, weight: 12, reps: 12, rpe: 8 }] },
          { name: "Rear Delt Fly", sets: [{ set: 1, weight: 10, reps: 15, rpe: 6.5 }, { set: 2, weight: 10, reps: 15, rpe: 7 }] },
          { name: "Cable Curl", sets: [{ set: 1, weight: 25, reps: 12, rpe: 7 }, { set: 2, weight: 25, reps: 12, rpe: 7 }] },
          { name: "Tricep Pushdown", sets: [{ set: 1, weight: 30, reps: 15, rpe: 6.5 }, { set: 2, weight: 30, reps: 15, rpe: 7 }] },
        ],
        notes: "Shoulder caps responding well. Good pump.",
      },
      {
        date: "2026-03-17",
        type: "Quads & Calves",
        duration: 55,
        exercises: [
          { name: "Hack Squat", sets: [{ set: 1, weight: 140, reps: 10, rpe: 7 }, { set: 2, weight: 160, reps: 8, rpe: 8 }] },
          { name: "Leg Extension", sets: [{ set: 1, weight: 60, reps: 15, rpe: 7 }, { set: 2, weight: 60, reps: 15, rpe: 7.5 }] },
          { name: "Standing Calf Raise", sets: [{ set: 1, weight: 120, reps: 15, rpe: 7 }, { set: 2, weight: 120, reps: 15, rpe: 7 }] },
        ],
        notes: "Quad sweep improving. Hack squat feeling strong.",
      },
      {
        date: "2026-03-14",
        type: "Back & Chest",
        duration: 50,
        exercises: [
          { name: "Lat Pulldown", sets: [{ set: 1, weight: 80, reps: 10, rpe: 7 }, { set: 2, weight: 85, reps: 8, rpe: 7.5 }] },
          { name: "Seated Row", sets: [{ set: 1, weight: 70, reps: 10, rpe: 7 }, { set: 2, weight: 70, reps: 10, rpe: 7 }] },
          { name: "Incline Dumbbell Press", sets: [{ set: 1, weight: 25, reps: 12, rpe: 7 }, { set: 2, weight: 25, reps: 12, rpe: 7 }] },
        ],
        notes: "Back width improving. Upper chest is lagging.",
      },
    ],
    sessionsPerWeek: 5,
    sessionsThisWeek: 4,
    totalSessions: 12,
    streak: { current: 12, best: 12, unit: "sessions" },
    nutrition: { tracking: true, proteinAvg: 145, proteinTarget: 140, calorieAvg: 1550, calorieTarget: 1500 },
    insight: "Jennifer is 16 weeks out from her show. Physique is developing well. Glutes and shoulders are priority areas.",
    coachAngle: "Begin posing practice. Add one extra glute session per week. Start cardio protocol next week.",
    narrative: "Perfect attendance. Down 2 lbs while maintaining muscle. On track for stage.",
    attendanceRate: 98,
    weightData: [138, 137.5, 137, 136.5, 136.5, 136, 136],
  },
];

const chatSeedMessages = [
  { type: "ai", text: "**Good morning, Coach!**\n\nYou have 8 sessions scheduled today. Here's what needs your attention:\n\n- **Sarah Chen** — Lower body today. Squat hit 120x6 last session, ready to test progression\n- **Marcus Johnson** — Assessment due. It's been 8 weeks since his baseline\n- **Emily Rodriguez** — Missed last 2 sessions. Consider a check-in\n\nWant me to pull up anyone's program?" },
];

const suggestedPrompts = [
  "Pull up Sarah's program",
  "What did Marcus do last session?",
  "Build a workout for Emily",
  "Who needs programming this week?",
  "Show me Sarah's squat progression",
];

// Demo client data for Milton AI responses
const demoClients = {
  sarah: {
    name: "Sarah Chen",
    goal: "Lose 20 lbs, squat 135",
    status: "progressing",
    week: 7,
    win: "Squat up 25 lbs since assessment",
    issue: "Bench press stalling at 70 lbs for 2 weeks",
    sessionsThisWeek: "2 of 3 completed",
    lastSession: "Lower Body — March 21",
    nextSession: "Upper Body Pull — suggested",
    action: "Test squat 1RM next week. Add extra pressing volume.",
    insight: "Strong lower body gains. Upper body needs more frequency or volume to break plateau."
  },
  marcus: {
    name: "Marcus Johnson", 
    goal: "Gain 15 lbs muscle, bench 225",
    status: "highly-engaged",
    week: 10,
    win: "Bench up 20 lbs, deadlift up 50 lbs since assessment",
    issue: "Assessment overdue — 8 weeks since last InBody",
    sessionsThisWeek: "4 of 5 completed",
    lastSession: "Push — March 20",
    nextSession: "Legs — scheduled",
    action: "Schedule InBody scan. Update training maxes for new block.",
    insight: "Gained 7 lbs bodyweight with minimal fat gain. Ready for reassessment."
  },
  emily: {
    name: "Emily Rodriguez",
    goal: "Lose 25 lbs, feel confident", 
    status: "at-risk",
    week: 5,
    issue: "Missed last 2 sessions. Current program ends this week.",
    sessionsThisWeek: "0 of 3 completed",
    lastSession: "Full Body — March 10",
    nextSession: "Needs new program",
    action: "Check in with Emily. Design a simpler 2x/week program to restart momentum.",
    insight: "Was making good progress but attendance dropped. May be overwhelmed."
  },
  david: {
    name: "David Park",
    goal: "Compete in first powerlifting meet",
    status: "highly-engaged", 
    week: 11,
    win: "All lifts progressing toward meet goals. 295 squat, 205 bench PR, 365 deadlift",
    sessionsThisWeek: "3 of 4 completed",
    lastSession: "Squat Day — March 21",
    nextSession: "Bench Day — today",
    action: "Start peaking protocol in 4 weeks. Consider mock meet for practice.",
    insight: "12 weeks out from meet. Squat close to 315, deadlift to 405, bench to 225."
  },
  rachel: {
    name: "Rachel Kim",
    goal: "Return to pre-pregnancy fitness",
    status: "new-client",
    week: 3,
    win: "Perfect attendance — 6 of 6 sessions completed",
    sessionsThisWeek: "2 of 2 completed",
    lastSession: "Full Body — March 22",
    nextSession: "Full Body — scheduled",
    action: "Progress to goblet squats with 25 lbs. Continue core focus.",
    insight: "Core stability improving. Ready to add light resistance. Celebrate the consistency!"
  }
};

function generateAIResponse(msg) {
  const lower = msg.toLowerCase();
  
  // Find mentioned client
  const clientKeys = Object.keys(demoClients);
  const matchedKey = clientKeys.find(k => lower.includes(k) || lower.includes(demoClients[k].name.toLowerCase()));
  const client = matchedKey ? demoClients[matchedKey] : null;

  // CRAFT MESSAGE / WRITE MESSAGE / DRAFT MESSAGE - TOP PRIORITY
  if ((lower.includes("craft") || lower.includes("write") || lower.includes("draft") || lower.includes("send")) && (lower.includes("message") || lower.includes("text") || lower.includes("reach out"))) {
    if (client) {
      const first = client.name.split(" ")[0];
      const missedSessions = client.sessionsThisWeek?.includes("0") || client.issue?.toLowerCase().includes("missed") || client.status === "at-risk";
      
      let messageText = "";
      let messagePurpose = "";
      
      if (missedSessions || client.status === "at-risk" || lower.includes("rebook") || lower.includes("missed")) {
        // REBOOKING MESSAGE - Priority #1
        messagePurpose = "Rebooking";
        messageText = `Hey ${first}! Wanted to check in - looks like we haven't connected in a bit. Life happens! When works best to get you back on track? I can work with whatever fits your schedule this week.`;
      } else if (client.win) {
        // CELEBRATION MESSAGE
        messagePurpose = "Celebration";
        messageText = `Hey ${first}! Just wanted to say - ${client.win.toLowerCase()}! You're putting in the work and it's showing. Keep it up!`;
      } else if (client.issue) {
        // CHECK-IN MESSAGE
        messagePurpose = "Check-in";
        messageText = `Hey ${first}! Quick check-in - how's everything going? ${client.issue.includes("Bench") ? "I noticed the bench has been tricky lately - want to chat about some adjustments?" : "Let me know if there's anything you need."}`; 
      } else {
        // GENERAL CHECK-IN
        messagePurpose = "General";
        messageText = `Hey ${first}! Just checking in - how's everything going? Let me know if there's anything you need this week.`;
      }
      
      return {
        title: `Message for ${first}`,
        text: `**Message for ${client.name}:**\n\n---\n\n"${messageText}"\n\n---\n\n**Purpose:** ${messagePurpose}\n**Ready to copy and send!**`
      };
    }
    return {
      title: "Craft Message",
      text: `**Which client would you like me to write a message for?**\n\n**Need rebooking (priority):**\n- Emily Rodriguez — Missed last 2 sessions\n- Daniel Torres — Hasn't trained in a week\n\n**Check-ins:**\n- Marcus Johnson — Assessment overdue\n- Sarah Chen — Doing great, could celebrate wins`
    };
  }

  // PULL UP PROGRAM / VIEW CLIENT
  if ((lower.includes("pull up") || lower.includes("show me") || lower.includes("open")) && client) {
    const first = client.name.split(" ")[0];
    return {
      title: `${first}'s Program`,
      text: `**${client.name}** — Week ${client.week}\n\n**Goal:** ${client.goal}\n\n**Training Status:**\n- ${client.sessionsThisWeek}\n- Last session: ${client.lastSession}\n- Next session: ${client.nextSession}\n\n${client.win ? `**Recent win:** ${client.win}` : `**Current issue:** ${client.issue}`}\n\n**My recommendation:** ${client.action}\n\nWant me to build their next workout or show their lift progression?`
    };
  }

  // LAST SESSION / WHAT DID THEY DO
  if ((lower.includes("last session") || lower.includes("last workout") || lower.includes("what did") || lower.includes("previous")) && client) {
    const first = client.name.split(" ")[0];
    return {
      title: `${first}'s Last Session`,
      text: `**${first}'s last session:** ${client.lastSession}\n\n${client.win ? `**Highlight:** ${client.win}` : ""}\n\n**Key lifts from recent sessions:**\n- Squat: progressing well\n- Bench: ${client.issue && client.issue.includes("Bench") ? "stalling — needs adjustment" : "on track"}\n- Deadlift: moving up\n\n**Session notes:** Good energy, form improvements noted.\n\nWant me to generate the next session based on this progression?`
    };
  }

  // BUILD WORKOUT / GENERATE PROGRAM
  if ((lower.includes("build") || lower.includes("create") || lower.includes("generate") || lower.includes("make")) && (lower.includes("workout") || lower.includes("program") || lower.includes("session"))) {
    if (client) {
      const first = client.name.split(" ")[0];
      return {
        title: `Building Workout for ${first}`,
        text: `**I'll create a workout for ${first}!**\n\nBased on their recent sessions and progressive overload, here's what I recommend for ${client.nextSession}:\n\n**Primary focus:** Continue building on recent PRs\n**Suggested exercises:** Based on their program and last session performance\n\nWant me to open the workout canvas so you can review and adjust the full program?`
      };
    }
    return {
      title: "Build Workout",
      text: `**I can build a workout!** Which client would you like me to program for?\n\n- Sarah Chen (Lower Body Pull next)\n- Marcus Johnson (Legs day)\n- Emily Rodriguez (Needs new program)\n- David Park (Bench Day today)\n- Rachel Kim (Full Body)`
    };
  }

  // WHO NEEDS PROGRAMMING
  if (lower.includes("programming") || lower.includes("needs program") || lower.includes("program this week")) {
    return { 
      title: "Programming Needed", 
      text: `**Clients who need programming:**\n\n- **Emily Rodriguez** — Her current program ends this week. Missed last 2 sessions, so I'd suggest a simpler 2x/week restart program.\n\n- **Daniel Torres** — Hasn't trained in a week. May need a modified program to re-engage.\n\n**Everyone else is on track** with current programming.\n\nWant me to build a program for Emily or Daniel?`
    };
  }

  // SQUAT / LIFT PROGRESSION
  if ((lower.includes("progression") || lower.includes("progress")) && (lower.includes("squat") || lower.includes("bench") || lower.includes("deadlift") || lower.includes("lift"))) {
    if (client) {
      const first = client.name.split(" ")[0];
      return {
        title: `${first}'s Lift Progression`,
        text: `**${first}'s strength progression:**\n\n${client.win || "Making steady progress across all lifts."}\n\n**My analysis:** ${client.insight}\n\n**Recommendation:** ${client.action}\n\nWant me to show you the full progression chart or update their training maxes?`
      };
    }
    return {
      title: "Lift Progression",
      text: `**Which client's progression would you like to see?**\n\n- Sarah Chen — Squat up 25 lbs\n- Marcus Johnson — All lifts progressing\n- David Park — Meet prep, all PRs\n- Lisa Martinez — Olympic lifts improving`
    };
  }

  // WHO NEEDS ATTENTION / PRIORITY QUEUE
  if (lower.includes("attention") || lower.includes("who needs") || lower.includes("priority") || lower.includes("queue") || lower.includes("summarize") || lower.includes("follow up")) {
    return { 
      title: "Priority Queue", 
      text: `**Here's who needs your attention today:**\n\n**REBOOKING NEEDED (Priority #1):**\n- **Emily Rodriguez** (Week 5) — Missed last 2 sessions. Her program ends this week. Reach out to rebook!\n- **Daniel Torres** — Hasn't trained in a week. Was making great progress (down 7 lbs). Get him back on the calendar!\n\n**Other follow-ups:**\n- **Marcus Johnson** (Week 10) — Assessment overdue. 8 weeks since InBody.\n\n**Sessions today:** Sarah Chen, David Park, Lisa Martinez, Michael Brown\n\nWant me to craft a rebooking message for Emily or Daniel?`
    };
  }

  // WHO IS DOING WELL / WINS
  if (lower.includes("doing well") || lower.includes("going well") || lower.includes("good news") || lower.includes("wins") || lower.includes("celebrate") || lower.includes("crushing")) {
    return {
      title: "Client Wins",
      text: `**Great news to share:**\n\n- **Sarah Chen** — Squat up 25 lbs since assessment! Down 5 lbs while gaining lean mass.\n\n- **Rachel Kim** — Perfect attendance, 6 of 6 sessions. Core stability improving after pregnancy.\n\n- **David Park** — PRs on all three lifts. 295 squat, 205 bench, 365 deadlift. On track for his meet.\n\n- **Jennifer Lee** — 12 sessions in a row. Stage-ready physique developing.\n\nWant me to help you celebrate any of these wins with the client?`
    };
  }

  // ASSESSMENT DUE
  if (lower.includes("assessment") || lower.includes("reassess") || lower.includes("inbody")) {
    return {
      title: "Assessments",
      text: `**Assessment status:**\n\n- **Marcus Johnson** — OVERDUE. 8 weeks since last InBody. Gained 7 lbs, lifts are up. Schedule scan this week.\n\n**Everyone else** is within their assessment window.\n\nWant me to add an assessment reminder for Marcus?`
    };
  }

  // LOG SESSION
  if (lower.includes("log") && (lower.includes("session") || lower.includes("workout"))) {
    if (client) {
      const first = client.name.split(" ")[0];
      return {
        title: `Log Session for ${first}`,
        text: `**Ready to log a session for ${first}!**\n\nI'll open the session logging canvas. You can:\n- Start with their prescribed workout\n- Edit weights, reps, and RPE as they complete each set\n- Add notes about form, energy, or anything notable\n\nWant me to open the session logger?`
      };
    }
    return {
      title: "Log Session",
      text: `**Which client's session would you like to log?**\n\n**Sessions today:**\n- Sarah Chen — Lower Body\n- David Park — Bench Day\n- Lisa Martinez — Olympic Technique\n- Michael Brown — Power`
    };
  }

  // CLIENT-SPECIFIC QUERIES
  if (client) {
    const first = client.name.split(" ")[0];
    
    // Progress/status questions  
    if (lower.includes("progress") || lower.includes("doing") || lower.includes("status") || lower.includes("update") || lower.includes("how is")) {
      return {
        title: `${first}'s Status`,
        text: `**${client.name}** — Week ${client.week}, ${client.status.replace("-", " ")}\n\n**Goal:** ${client.goal}\n\n**Training:**\n- ${client.sessionsThisWeek}\n- Last: ${client.lastSession}\n- Next: ${client.nextSession}\n\n${client.win ? `**Recent win:** ${client.win}` : `**Current issue:** ${client.issue}`}\n\n**My take:** ${client.insight}\n\n**Recommended:** ${client.action}`
      };
    }

    // Default client info
    return {
      title: `About ${first}`,
      text: `**${client.name}** — Week ${client.week}\n\n**Goal:** ${client.goal}\n\n**Status:** ${client.status.replace("-", " ")}\n\n**Training:**\n- ${client.sessionsThisWeek}\n- Last: ${client.lastSession}\n- Next: ${client.nextSession}\n\n${client.win ? `**Win:** ${client.win}` : `**Issue:** ${client.issue}`}\n\n**Recommended action:** ${client.action}`
    };
  }

  // HELP / CAPABILITIES
  if (lower.includes("help") || lower.includes("what can")) {
    return {
      title: "How I Can Help",
      text: `**I'm Milton, your training copilot.** Try asking me:\n\n- "Pull up Sarah's program"\n- "What did Marcus do last session?"\n- "Build a workout for Emily"\n- "Who needs programming this week?"\n- "Show me Sarah's squat progression"\n- "Log a session for David"\n\nI know all your clients and can help with programming, session logging, and tracking progress.`
    };
  }

  // DEFAULT
  return { 
    title: "Milton", 
    text: `**I'm here to help!** Try asking:\n\n- "Pull up Sarah's program"\n- "Who needs attention today?"\n- "Build a workout for Emily"\n- "What did Marcus do last session?"\n- "Show me lift progression"`
  };
}

function Avatar({ name, size = 36 }) {
  const colors = ["#2B7A78", "#3aafa9", "#5CDB95", "#45818e", "#6aa84f", "#e06666", "#f6b26b", "#8e7cc3"];
  const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: colors[idx],
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: size * 0.38, fontWeight: 600, flexShrink: 0
    }}>{initials}</div>
  );
}

function ConnectorDot({ type, first }) {
  const c = dataConnectors[type] || { bg: "#999", color: "#fff", name: "?", icon: () => null };
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%", background: c.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      marginLeft: first ? 0 : -6, position: "relative", zIndex: 1,
      border: "2px solid #fff"
    }}>{c.icon ? c.icon(14) : null}</div>
  );
}

function AlertBadge({ type, label }) {
  const colors = {
    red: { bg: "#fde8e7", color: "#c0392b", border: "#f5c6c0" },
    blue: { bg: "#e3f2fd", color: TEAL, border: "#b6dfd8" },
    green: { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7" },
  };
  const c = colors[type] || colors.blue;
  return (
    <span style={{
      display: "inline-block", padding: "4px 12px", borderRadius: 20,
      background: c.bg, color: c.color, fontSize: 12, fontWeight: 600,
      border: `1px solid ${c.border}`, whiteSpace: "nowrap"
    }}>{label}</span>
  );
}

function StreakBadge({ streak, compact }) {
  if (!streak || !streak.best || streak.best.days < 3) return null;
  const d = streak.best.days;
  const labels = { logging: "Logging", exercise: "Exercise", steps: "Steps" };
  const isHot = d >= 14;
  const isFire = d >= 21;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: compact ? 3 : 4,
      padding: compact ? "3px 8px" : "4px 10px", borderRadius: 16,
      background: isFire ? "#fff3e0" : isHot ? "#fff8e1" : "#f0f4f3",
      border: `1px solid ${isFire ? "#ffe0b2" : isHot ? "#fff176" : BORDER}`,
      fontSize: compact ? 10 : 11, fontWeight: 700,
      color: isFire ? "#e65100" : isHot ? "#f57f17" : TEXT_SEC,
      whiteSpace: "nowrap"
    }}>
      <span style={{ fontSize: compact ? 10 : 12 }}>{isFire ? "🔥" : isHot ? "🔥" : "⚡"}</span>
      {d}d {!compact && (labels[streak.best.type] || "")}
    </span>
  );
}

function ProgressBar({ value }) {
  return (
    <div style={{ width: 100, height: 6, borderRadius: 3, background: "#e0ebe8" }}>
      <div style={{
        width: `${value}%`, height: "100%", borderRadius: 3,
        background: `linear-gradient(90deg, ${TEAL}, ${SAGE})`,
        transition: "width 1s ease"
      }} />
    </div>
  );
}


function ReportBlock({ id, label, customizeMode, onEditBlock, onRemoveBlock, children }) {
  const [hov, setHov] = useState(false);
  if (!customizeMode) return children;
  return (
    <div
      style={{ position: "relative", borderRadius: 22, transition: "all 0.2s ease",
        outline: hov ? "2px solid rgba(43,122,120,0.35)" : "2px solid transparent",
        outlineOffset: 4
      }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      {children}
      <div style={{
        position: "absolute", top: 10, right: 10, display: "flex", gap: 6, zIndex: 10,
        opacity: hov ? 1 : 0, transform: hov ? "translateY(0)" : "translateY(-4px)",
        transition: "all 0.2s ease", pointerEvents: hov ? "auto" : "none"
      }}>
        <div onClick={() => onEditBlock(id, label)} style={{
          padding: "5px 12px", borderRadius: 20,
          background: "linear-gradient(135deg, #2B7A78, #3aafa9)", color: "#fff",
          fontSize: 11, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 2px 8px rgba(43,122,120,0.35)",
          display: "flex", alignItems: "center", gap: 5
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83"/></svg>
          Edit with Milton
        </div>
        <div onClick={() => onRemoveBlock(id)} style={{
          padding: "5px 10px", borderRadius: 20, background: "rgba(255,255,255,0.95)",
          border: "1px solid #e0ebe8", color: "#5f7a76", fontSize: 11, fontWeight: 600,
          cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
        }}>Remove</div>
      </div>
      {hov && <div style={{
        position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
        padding: "3px 10px", borderRadius: 10, background: "rgba(43,122,120,0.08)",
        fontSize: 10, fontWeight: 600, color: "#2B7A78", whiteSpace: "nowrap"
      }}>{label}</div>}
    </div>
  );
}

function ChatContent({ chatInput, setChatInput, messages, onSend, chatEndRef, isMobile, typing, canvasType }) {
  const font = `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif`;
  const showSuggestions = messages.length <= 1 && !typing && canvasType !== "messages";
  return (
    <>
    <div style={{
    flex: 1, overflowY: "auto", padding: isMobile ? "16px 14px 8px" : "20px 20px 8px",
    display: "flex", flexDirection: "column", gap: 20,
    background: isMobile ? "transparent" : "#fafcfb",
    scrollbarWidth: "none", msOverflowStyle: "none"
    }} className="hide-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex", flexDirection: "column",
            alignItems: msg.type === "user" ? "flex-end" : "flex-start",
            opacity: 0, animation: "fadeSlideIn 0.4s ease forwards",
            animationDelay: `${Math.min(i * 0.05, 0.3)}s`
          }}>
            {msg.type === "user" ? (
              <div style={{
                background: USER_BUBBLE, color: "#fff", padding: "10px 16px",
                borderRadius: "18px 18px 4px 18px", fontSize: 14, fontWeight: 500,
                maxWidth: "85%", lineHeight: 1.5,
                boxShadow: "0 2px 8px rgba(43,122,120,0.15)"
              }}>{msg.text}</div>
            ) : (
              <div style={{ display: "flex", gap: 12, maxWidth: "95%", width: "100%" }}>
                <div style={{ 
                  width: 28, height: 28, borderRadius: "50%", overflow: "hidden", 
                  flexShrink: 0, marginTop: 2,
                  background: TEAL,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <img src={LOGO_URL} alt="Milton" style={{ width: 28, height: 28 }} />
                </div>
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <FormattedText text={msg.text} color={TEXT_SEC} />
                  {msg.options && msg.onSelect && (
                    <ChatOptions 
                      options={msg.options} 
                      multiSelect={msg.multiSelect} 
                      onSelect={msg.onSelect}
                      disabled={msg.answered}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
{typing && (
    <div style={{ display: "flex", gap: 12, maxWidth: "95%", opacity: 0, animation: "fadeSlideIn 0.3s ease forwards" }}>
    <div style={{ 
      width: 28, height: 28, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
      background: TEAL, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
    <img src={LOGO_URL} alt="Milton" style={{ width: 28, height: 28 }} />
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 6 }}>
      <span style={{ 
        fontSize: 13, 
        color: TEXT_SEC, 
        fontStyle: "italic",
        animation: "pulse 2s ease-in-out infinite"
      }}>Thinking</span>
      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
        {[0,1,2].map(j => (
          <div key={j} style={{ 
            width: 4, height: 4, borderRadius: "50%", 
            background: TEXT_SEC, 
            animation: `typingDot 1.4s ease ${j * 0.2}s infinite` 
          }} />
        ))}
      </div>
    </div>
    </div>
    )}
    {showSuggestions && (
    <div style={{ 
      display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8,
      opacity: 0, animation: "fadeSlideIn 0.4s ease 0.3s forwards"
    }}>
      {suggestedPrompts.map((prompt, i) => (
        <button
          key={i}
          onClick={() => onSend(prompt)}
          style={{
            background: WHITE,
            border: `1px solid ${BORDER}`,
            borderRadius: 20,
            padding: "8px 14px",
            fontSize: 13,
            fontFamily: font,
            color: TEAL,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s ease",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = TEAL;
            e.currentTarget.style.color = WHITE;
            e.currentTarget.style.borderColor = TEAL;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = WHITE;
            e.currentTarget.style.color = TEAL;
            e.currentTarget.style.borderColor = BORDER;
          }}
        >
          {prompt}
        </button>
      ))}
    </div>
    )}
    <div ref={chatEndRef} />
    </div>
      <div style={{ padding: isMobile ? "8px 12px 12px" : "12px 16px 16px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, background: WHITE,
          borderRadius: 24, border: `1.5px solid ${BORDER}`, padding: "10px 12px 10px 16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
        }}>
          <input value={chatInput} onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && chatInput.trim()) { onSend(chatInput.trim()); setChatInput(""); }}}
            placeholder="Ask Milton about your clients..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: font, color: TEXT, background: "transparent" }}
          />
          <div onClick={() => { if (chatInput.trim()) { onSend(chatInput.trim()); setChatInput(""); }}} style={{
            width: 32, height: 32, borderRadius: "50%", background: chatInput.trim() ? TEAL : "#c8d8d4",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: chatInput.trim() ? "pointer" : "default",
            boxShadow: chatInput.trim() ? "0 2px 6px rgba(43,122,120,0.3)" : "none", transition: "all 0.15s ease"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
              <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5,12 12,5 19,12"/>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Mobile Glass Chat Bar + Expandable Sheet ─── */
function MobileChatSheet({ chatOpen, setChatOpen, chatInput, setChatInput, messages, onSend, chatEndRef, typing, canvasMode }) {
  const [sheetHeight, setSheetHeight] = useState(65);
  const startY = useRef(0);
  const startH = useRef(65);
  const inputRef = useRef(null);
  const font = `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif`;

  const onDragStart = useCallback((e) => {
    e.preventDefault();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startY.current = clientY;
    startH.current = sheetHeight;
    const onMove = (ev) => {
      ev.preventDefault();
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const deltaVh = ((startY.current - cy) / window.innerHeight) * 100;
      setSheetHeight(Math.min(94, Math.max(15, startH.current + deltaVh)));
    };
    const onEnd = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove, { passive: false });
      document.removeEventListener("touchend", onEnd);
      setSheetHeight(h => {
        if (h < 25) { setChatOpen(false); return 65; }
        return h;
      });
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
  }, [sheetHeight, setChatOpen]);

  const glass = {
    background: "rgba(247, 250, 249, 0.72)",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
  };

  return (
    <>
      {/* ── Collapsed: floating glass chat bar (hidden when canvas sheet is open) ── */}
      {!chatOpen && !canvasMode && (
        <div
          onClick={() => { setChatOpen(true); setTimeout(() => inputRef.current?.focus(), 350); }}
          style={{
            position: "fixed", bottom: 16, left: 16, right: 16, zIndex: 80,
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            borderRadius: 26, padding: "12px 16px",
            border: "1px solid rgba(224,235,232,0.6)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)",
            cursor: "text"
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: `linear-gradient(135deg, ${TEAL}, ${SAGE})`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            boxShadow: "0 2px 8px rgba(43,122,120,0.25)"
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="1" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/>
            </svg>
          </div>
          <span style={{ flex: 1, fontSize: 14, color: TEXT_SEC, fontWeight: 500 }}>
            Ask Milton anything...
          </span>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: `linear-gradient(135deg, ${TEAL}, ${SAGE})`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            boxShadow: "0 2px 6px rgba(43,122,120,0.3)"
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
              <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5,12 12,5 19,12"/>
            </svg>
          </div>
        </div>
      )}

      {/* ── Expanded: glass bottom sheet ── */}
      {chatOpen && (
        <>
          <div onClick={() => setChatOpen(false)} style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)",
            zIndex: 90, transition: "opacity 0.3s ease"
          }} />
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            height: `${sheetHeight}vh`,
            ...glass, background: "rgba(243, 246, 244, 0.82)",
            zIndex: 100, borderRadius: "22px 22px 0 0",
            boxShadow: "0 -6px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
            border: "1px solid rgba(224,235,232,0.5)", borderBottom: "none",
            display: "flex", flexDirection: "column", overflow: "hidden"
          }}>
            {/* Drag handle */}
            <div onMouseDown={onDragStart} onTouchStart={onDragStart}
              style={{ cursor: "grab", padding: "12px 0 6px", touchAction: "none", flexShrink: 0 }}>
              <div style={{ width: 40, height: 5, borderRadius: 3, background: "rgba(43,122,120,0.25)", margin: "0 auto" }} />
            </div>
            {/* Messages */}
            <div style={{
              flex: 1, overflowY: "auto", padding: "16px 14px 8px",
              display: "flex", flexDirection: "column", gap: 18,
              scrollbarWidth: "none", msOverflowStyle: "none"
            }} className="hide-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} style={{
                  display: "flex", flexDirection: "column",
                  alignItems: msg.type === "user" ? "flex-end" : "flex-start",
                  opacity: 0, animation: "fadeSlideIn 0.4s ease forwards",
                  animationDelay: `${Math.min(i * 0.05, 0.3)}s`
                }}>
                  {msg.type === "user" ? (
                    <div style={{
                      background: USER_BUBBLE, color: "#fff", padding: "10px 16px",
                      borderRadius: "18px 18px 4px 18px", fontSize: 14, fontWeight: 500,
                      maxWidth: "85%", lineHeight: 1.5,
                      boxShadow: "0 2px 8px rgba(43,122,120,0.15)"
                    }}>{msg.text}</div>
                  ) : (
                    <div style={{ display: "flex", gap: 12, maxWidth: "95%", width: "100%" }}>
                      <div style={{ 
                        width: 26, height: 26, borderRadius: "50%", overflow: "hidden", 
                        flexShrink: 0, marginTop: 2,
                        background: TEAL,
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <img src={LOGO_URL} alt="Milton" style={{ width: 26, height: 26 }} />
                      </div>
<div style={{ flex: 1, paddingTop: 2 }}>
                <FormattedText text={msg.text} color={TEXT_SEC} />
                {msg.options && msg.onSelect && (
                  <ChatOptions 
                    options={msg.options} 
                    multiSelect={msg.multiSelect} 
                    onSelect={msg.onSelect}
                    disabled={msg.answered}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      ))}
      {typing && (
    <div style={{ display: "flex", gap: 12, maxWidth: "95%", opacity: 0, animation: "fadeSlideIn 0.3s ease forwards" }}>
    <div style={{ 
      width: 26, height: 26, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
      background: TEAL, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
                    <img src={LOGO_URL} alt="Milton" style={{ width: 26, height: 26 }} />
                  </div>
                  <div style={{ display: "flex", gap: 5, alignItems: "center", paddingTop: 6 }}>
                    {[0,1,2].map(j => (
                      <div key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: TEAL, opacity: 0.5, animation: `typingDot 1.2s ease ${j*0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
{messages.length <= 1 && !typing && !canvasMode && (
  <div style={{
  display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8,
  opacity: 0, animation: "fadeSlideIn 0.4s ease 0.3s forwards"
  }}>
  {suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => { onSend(prompt); }}
                      style={{
                        background: "rgba(255,255,255,0.85)",
                        border: "1px solid rgba(224,235,232,0.7)",
                        borderRadius: 18,
                        padding: "8px 14px",
                        fontSize: 13,
                        fontFamily: font,
                        color: TEXT_SEC,
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            {/* Input */}
            <div style={{
              padding: "8px 12px", paddingBottom: "max(12px, env(safe-area-inset-bottom))",
              borderTop: "1px solid rgba(224,235,232,0.4)",
              ...glass, background: "rgba(247,250,249,0.6)"
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.8)", borderRadius: 22,
                border: "1px solid rgba(224,235,232,0.7)",
                padding: "10px 12px 10px 16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
              }}>
                <input ref={inputRef} value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && chatInput.trim()) { onSend(chatInput.trim()); setChatInput(""); }}}
                  placeholder="Ask Milton about your clients..."
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: font, color: TEXT, background: "transparent" }}
                />
                <div onClick={() => { if (chatInput.trim()) { onSend(chatInput.trim()); setChatInput(""); }}} style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: chatInput.trim() ? `linear-gradient(135deg, ${TEAL}, ${SAGE})` : "#c8d8d4",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: chatInput.trim() ? "pointer" : "default",
                  transition: "all 0.15s ease"
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5,12 12,5 19,12"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ═══════���═══════════════════════════════════
   MOBILE CANVAS SHEET - Swipe up drawer for canvas/inbox/schedule
   ═════════════════════════════════════════════ */
function MobileCanvasSheet({ 
  isOpen, 
  onClose, 
  canvasType, 
  canvasData,
  setCanvasType,
  setCanvasData,
  setCanvasMode,
  setChatMessages,
  setChatTyping,
  onChatSend,
  clients
}) {
  const [sheetHeight, setSheetHeight] = useState(96);
  const [localChatInput, setLocalChatInput] = useState("");
  const startY = useRef(0);
  const startH = useRef(96);
  const font = `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif`;

  const onDragStart = useCallback((e) => {
    e.preventDefault();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startY.current = clientY;
    startH.current = sheetHeight;
    const onMove = (ev) => {
      ev.preventDefault();
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const deltaVh = ((startY.current - cy) / window.innerHeight) * 100;
      setSheetHeight(Math.min(96, Math.max(30, startH.current + deltaVh)));
    };
    const onEnd = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove, { passive: false });
      document.removeEventListener("touchend", onEnd);
      setSheetHeight(h => {
        if (h < 45) { 
          onClose(); 
          return 96; 
        }
        return h;
      });
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
  }, [sheetHeight, onClose]);

  const glass = {
    background: "rgba(247, 250, 249, 0.95)",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
  };

  const getTitle = () => {
    switch(canvasType) {
      case "schedule": return "Schedule";
      case "inbox": return "Inbox";
      case "templates": return "Canvas";
      case "mealPlan": return "Meal Plan";
      case "workout": return "Workout Program";
      case "messages": return "Messages";
      case "report": return "Reports";
      case "messageSequence": return "Message Sequence";
      default: return "Canvas";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)",
          zIndex: 90, transition: "opacity 0.3s ease"
        }} 
      />
      
      {/* Sheet */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        height: `${sheetHeight}vh`,
        ...glass,
        zIndex: 100, borderRadius: "22px 22px 0 0",
        boxShadow: "0 -6px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
        border: "1px solid rgba(224,235,232,0.5)", borderBottom: "none",
        display: "flex", flexDirection: "column", overflow: "hidden"
      }}>
        {/* Header with drag handle */}
        <div style={{ flexShrink: 0 }}>
          {/* Drag handle */}
          <div 
            onMouseDown={onDragStart} 
            onTouchStart={onDragStart}
            style={{ cursor: "grab", padding: "12px 0 6px", touchAction: "none" }}
          >
            <div style={{ width: 40, height: 5, borderRadius: 3, background: "rgba(43,122,120,0.25)", margin: "0 auto" }} />
          </div>
          
          {/* Title bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "4px 16px 12px",
            borderBottom: `1px solid ${BORDER}`
          }}>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8, border: "none",
                background: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: TEXT_SEC
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            
            <span style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>{getTitle()}</span>
            
            <button
              style={{
                width: 32, height: 32, borderRadius: 8, border: "none",
                background: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: TEXT_SEC
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Canvas Content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {canvasType === "templates" && (
            <CanvasTemplates 
              isMobile={true}
              onSelect={(templateType) => {
                if (templateType === "mealPlan") {
                  setCanvasType("mealPlan");
                  setCanvasData({
                    client: "New Client",
                    goals: "General health and fitness",
                    weeklyTargets: { calories: 2000, protein: 150 }
                  });
                } else if (templateType === "workout") {
                  setCanvasType("workout");
                  setCanvasData({
                    clientName: "New Client",
                    programName: "Custom Program",
                    weeks: 4
                  });
                } else if (templateType === "messages") {
                  setCanvasType("messages");
                  setCanvasData({});
                } else if (templateType === "reports") {
                  setCanvasType("report");
                  setCanvasData({});
                }
              }}
              onClose={onClose}
            />
          )}
          {canvasType === "messages" && (
            <MessagesCanvas
              onClose={onClose}
              setChatMessages={setChatMessages}
              setChatTyping={setChatTyping}
            />
          )}
          {canvasType === "mealPlan" && (
            <MealPlanCanvas
              data={canvasData}
              onClose={onClose}
            />
          )}
          {canvasType === "workout" && (
            <WorkoutCanvas 
              data={canvasData}
              clients={clients}
              onClose={onClose}
            />
          )}
          {canvasType === "messageSequence" && (
            <MessageSequenceCanvas 
              data={canvasData}
              onClose={onClose}
            />
          )}
          {canvasType === "report" && (
            <ReportsCanvas
              onClose={onClose}
              setChatMessages={setChatMessages}
              setChatTyping={setChatTyping}
            />
          )}
          {canvasType === "inbox" && (
            <InboxCanvas
              isMobile={true}
              onClose={onClose}
            />
          )}
          {canvasType === "schedule" && (
            <ScheduleCanvas
              isMobile={true}
              onClose={onClose}
            />
          )}
        </div>
        
        {/* Chat Input at Bottom */}
        <div style={{
          padding: "8px 12px", paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          borderTop: `1px solid ${BORDER}`,
          background: "rgba(247,250,249,0.9)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)"
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.9)", borderRadius: 22,
            border: "1px solid rgba(224,235,232,0.7)",
            padding: "10px 12px 10px 16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}>
            <input 
              value={localChatInput} 
              onChange={e => setLocalChatInput(e.target.value)}
              onKeyDown={e => { 
                if (e.key === "Enter" && localChatInput.trim() && onChatSend) { 
                  onChatSend(localChatInput.trim()); 
                  setLocalChatInput(""); 
                }
              }}
              placeholder="Ask Milton anything..."
              style={{ 
                flex: 1, border: "none", outline: "none", 
                fontSize: 14, fontFamily: font, color: TEXT, background: "transparent" 
              }}
            />
            <div 
              onClick={() => { 
                if (localChatInput.trim() && onChatSend) { 
                  onChatSend(localChatInput.trim()); 
                  setLocalChatInput(""); 
                }
              }} 
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: localChatInput.trim() ? `linear-gradient(135deg, ${TEAL}, ${SAGE})` : "#c8d8d4",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: localChatInput.trim() ? "pointer" : "default",
                transition: "all 0.15s ease"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5,12 12,5 19,12"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═════════════════════════���══════════════���══
   REPORT VISUALIZATION SCREEN
   ═════════════════════════════════════════════ */
function ReportView({ client, onBack, isMobile, autoOpenShare = false }) {
  const [expandedSection, setExpandedSection] = useState(null);
  const [showShare, setShowShare] = useState(autoOpenShare);
  const [linkCopied, setLinkCopied] = useState(false);
  const reportRef = useRef(null);
  const font = `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif`;

  const shareLink = `https://app.miltonai.com/report/${client.name.toLowerCase().replace(/ /g,"-")}-${Date.now().toString(36)}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareLink).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  // Data calculations - attendance is based on scheduled vs attended, not total purchased
  const attendedSessions = (client.sessions || []).length || client.totalSessions || client.workoutDays * 4 + 2;
  const scheduledSessions = client.scheduledSessions || attendedSessions; // If they've attended all scheduled, 100%
  const missedSessions = Math.max(0, scheduledSessions - attendedSessions);
  const attendanceRate = scheduledSessions > 0 ? Math.min(100, Math.round((attendedSessions / scheduledSessions) * 100)) : 100;
  
  // Body composition data
  const assessment = client.assessment || {};
  const current = client.current || {};
  const bodyweightStart = assessment.bodyweight || 185;
  const bodyweightCurrent = current.bodyweight || client.weightData?.[client.weightData?.length - 1] || 180;
  const bodyFatStart = assessment.bodyFat || 24;
  const bodyFatCurrent = current.bodyFat || 20;
  const leanMassStart = assessment.leanMass || Math.round(bodyweightStart * (1 - bodyFatStart / 100));
  const leanMassCurrent = current.leanMass || Math.round(bodyweightCurrent * (1 - bodyFatCurrent / 100));
  
  // Strength baselines and current
  const strengthBaselines = assessment.strengthBaselines || {
    squat: { weight: 135, reps: 5 },
    benchPress: { weight: 95, reps: 5 },
    deadlift: { weight: 185, reps: 5 }
  };
  const liftNames = { squat: "Squat", benchPress: "Bench Press", deadlift: "Deadlift", overheadPress: "OHP" };
  const liftColors = { squat: TEAL, benchPress: MINT, deadlift: "#3aafa9", overheadPress: "#8e7cc3" };
  
  // Calculate 1RMs
  const calc1RM = (weight, reps) => Math.round(weight * (36 / (37 - reps)));
  const lifts = Object.entries(strengthBaselines).slice(0, 3).map(([key, val]) => {
    const baseline1RM = calc1RM(val.weight, val.reps);
    const currentEst = Math.round(baseline1RM * (1.08 + (client.name.charCodeAt(0) % 10) / 100));
    return { key, name: liftNames[key], baseline: baseline1RM, current: currentEst, color: liftColors[key] || TEAL };
  });
  
  // Nutrition data
  const nutritionScore = Math.min(100, Math.round((client.mealsLogged / 21) * 100));
  const proteinAvg = client.proteinAvg || 120;
  const proteinTarget = client.proteinTarget || 140;
  const caloriesAvg = 1650;
  const caloriesTarget = 1800;
  
  // Wearable/Exercise data
  const steps = client.steps || 7500;
  const stepsGoal = 10000;
  const activeMinutes = 42;
  const activeMinutesGoal = 45;
  const workoutDays = client.workoutDays || 4;
  
  // Sleep data
  const sleepHours = 6.8;
  const sleepGoal = 8;
  const sleepQuality = "Good";
  const sleepConsistency = 72;
  
  // Goal progress
  const goals = client.goals || {};
  const goalWeight = goals.targetWeight || bodyweightStart - 15;
  const totalWeightGoal = Math.abs(goalWeight - bodyweightStart);
  const weightProgress = Math.abs(bodyweightCurrent - bodyweightStart);
  const goalProgressPct = Math.min(100, Math.round((weightProgress / totalWeightGoal) * 100));
  
  // Achievements & Streaks
  const currentStreak = Math.min(attendedSessions, 8);
  const bestStreak = Math.max(currentStreak, 12);
  const achievements = [
    { id: 1, name: "First Session", icon: "check", earned: attendedSessions >= 1, date: assessment.date },
    { id: 2, name: "5 Session Streak", icon: "fire", earned: bestStreak >= 5, date: "Week 2" },
    { id: 3, name: "10 Sessions Complete", icon: "trophy", earned: attendedSessions >= 10, date: "Week 3" },
    { id: 4, name: "Body Comp Warrior", icon: "muscle", earned: Math.abs(bodyFatCurrent - bodyFatStart) >= 2, date: "Week 4" },
    { id: 5, name: "PR Crusher", icon: "star", earned: lifts.some(l => l.current > l.baseline * 1.1), date: "Week 3" },
    { id: 6, name: "Nutrition Champion", icon: "apple", earned: nutritionScore >= 80, date: "This week" },
  ];
  
  const handleExportPDF = () => {
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${client.name} - Milton Report</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'DM Sans', sans-serif; color: #1a2e2a; background: #fff; padding: 40px; max-width: 700px; margin: 0 auto; }
      .card { border-radius: 16px; border: 1px solid #e0ebe8; padding: 24px; margin-bottom: 20px; }
      .section-title { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
      .sub { font-size: 13px; color: #5f7a76; }
      .header { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e0ebe8; }
      .logo { width: 32px; height: 32px; border-radius: 8px; background: #2B7A78; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; }
      .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      .stat-box { text-align: center; padding: 16px; background: #f7faf9; border-radius: 12px; }
      .stat-value { font-size: 24px; font-weight: 800; color: #2B7A78; }
      .stat-label { font-size: 12px; color: #5f7a76; margin-top: 4px; }
      @media print { body { padding: 20px; } .no-print { display: none !important; } }
    </style></head><body>
    <div class="header">
      <div class="logo">M</div>
      <div><div style="font-size:20px;font-weight:700">${client.name}</div><div class="sub">Report: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div></div>
    </div>
    <div class="card" style="background:linear-gradient(135deg,#f7faf9,#eef6f3);text-align:center">
      <div class="sub" style="text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px">Attendance Rate</div>
      <div style="font-size:56px;font-weight:800;color:#2B7A78">${attendanceRate}%</div>
      <div style="font-size:14px;color:#5f7a76;margin-top:4px">${attendedSessions}/${scheduledSessions} sessions attended</div>
    </div>
    <div class="card">
      <div class="section-title">Body Composition</div>
      <div class="stat-grid">
        <div class="stat-box"><div class="stat-value">${bodyweightCurrent}</div><div class="stat-label">Weight (lbs)</div></div>
        <div class="stat-box"><div class="stat-value">${bodyFatCurrent}%</div><div class="stat-label">Body Fat</div></div>
        <div class="stat-box"><div class="stat-value">${leanMassCurrent}</div><div class="stat-label">Lean Mass (lbs)</div></div>
      </div>
    </div>
    <div class="card">
      <div class="section-title">Strength (Est. 1RM)</div>
      <div class="stat-grid">${lifts.map(l => `<div class="stat-box"><div class="stat-value">${l.current}</div><div class="stat-label">${l.name}</div></div>`).join('')}</div>
    </div>
    <div class="card">
      <div class="section-title">Goal Progress</div>
      <div style="font-size:24px;font-weight:700;color:#2B7A78;margin-bottom:8px">${goalProgressPct}% to goal</div>
      <div class="sub">${bodyweightStart} lbs → ${bodyweightCurrent} lbs → ${goalWeight} lbs target</div>
    </div>
    <div style="text-align:center;margin-top:24px;color:#5f7a76;font-size:11px">Generated by Milton AI</div>
    <div class="no-print" style="text-align:center;margin-top:24px;">
      <button onclick="window.print()" style="padding:12px 28px;border-radius:10px;background:#2B7A78;color:#fff;font-size:14px;font-weight:600;border:none;cursor:pointer">Save as PDF</button>
    </div>
    </body></html>`;
    printWin.document.write(html);
    printWin.document.close();
  };

  const SectionCard = ({ children, style: s }) => (
    <div style={{
      background: WHITE, borderRadius: 20, border: `1px solid ${BORDER}`,
      padding: isMobile ? "20px" : "28px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", ...s
    }}>{children}</div>
  );

  const MetricCard = ({ label, value, unit, change, changeDir, color = TEAL }) => (
    <div style={{
      flex: 1, minWidth: isMobile ? "45%" : 120, padding: isMobile ? "16px 14px" : "20px 18px",
      background: `linear-gradient(135deg, ${color}06, ${color}03)`,
      borderRadius: 16, border: `1px solid ${color}15`, textAlign: "center"
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: isMobile ? 26 : 32, fontWeight: 800, color }}>{value}<span style={{ fontSize: 14, fontWeight: 600 }}>{unit}</span></div>
      {change !== undefined && (
        <div style={{
          marginTop: 6, fontSize: 12, fontWeight: 600,
          color: changeDir === "good" ? ALERT_GREEN : changeDir === "bad" ? "#ef6c3e" : TEXT_SEC
        }}>
          {change > 0 ? "+" : ""}{change}{unit} from start
        </div>
      )}
    </div>
  );

  const scoreColor = attendanceRate >= 85 ? ALERT_GREEN : attendanceRate >= 70 ? TEAL : "#ef6c3e";

  return (
    <div style={{
      flex: 1, overflowY: "auto",
      padding: isMobile ? "68px 14px 76px" : "24px 28px",
      display: "flex", flexDirection: "column", gap: isMobile ? 14 : 18
    }}>
      {/* Back */}
      {!isMobile && <div onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
        color: TEXT_SEC, fontSize: 14, fontWeight: 600, width: "fit-content"
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        Back to {client.name}
      </div>}

      {/* ─── HERO: ATTENDANCE RATE ─── */}
      <SectionCard style={{
        background: `linear-gradient(135deg, #f7faf9, #eef6f3, #f0f8f5)`,
        textAlign: "center", padding: isMobile ? "28px 20px" : "36px 32px",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: 300, height: 300, borderRadius: "50%",
          background: `radial-gradient(circle, ${scoreColor}18 0%, transparent 70%)`,
          pointerEvents: "none"
        }} />
        <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6, position: "relative" }}>
          {client.name}'s Attendance Rate
        </div>
        <div style={{ position: "relative", display: "inline-block", margin: "12px 0" }}>
          {(() => {
            const sz = isMobile ? 180 : 220;
            const r = sz / 2 - 16;
            const circ = 2 * Math.PI * r;
            const offset = circ * (1 - attendanceRate / 100);
            return (
              <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
                <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="#e0ebe8" strokeWidth="12"/>
                <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={scoreColor} strokeWidth="12"
                  strokeDasharray={circ} strokeDashoffset={offset}
                  strokeLinecap="round" transform={`rotate(-90 ${sz/2} ${sz/2})`}
                  style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
                />
                <circle cx={sz/2} cy={sz/2} r={r - 18} fill="none" stroke={`${scoreColor}15`} strokeWidth="1"/>
                <text x={sz/2} y={sz/2 - 8} textAnchor="middle" dominantBaseline="central"
                  style={{ fontSize: isMobile ? 52 : 64, fontWeight: 800, fill: TEXT, fontFamily: font }}>
                  {attendanceRate}%
                </text>
                <text x={sz/2} y={sz/2 + (isMobile ? 28 : 34)} textAnchor="middle" dominantBaseline="central"
                  style={{ fontSize: 13, fontWeight: 600, fill: TEXT_SEC, fontFamily: font }}>
                  {attendedSessions}/{scheduledSessions} sessions
                </text>
              </svg>
            );
          })()}
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: scoreColor, marginBottom: 6 }}>
            {attendanceRate >= 90 ? "Exceptional Commitment" : attendanceRate >= 75 ? "Strong Attendance" : attendanceRate >= 60 ? "Building Consistency" : "Getting Started"}
          </div>
          <div style={{ fontSize: 13, color: TEXT_SEC, maxWidth: 400, margin: "0 auto", lineHeight: 1.55 }}>
            Showing up is the foundation of results. Keep the momentum going.
          </div>
        </div>
      </SectionCard>

      {/* ─── GOAL PROGRESS ─── */}
      <SectionCard style={{ background: `linear-gradient(160deg, #f7fcfb, #eef8f5, #f5faf8)` }}>
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.1em" }}>Progress Toward Goal</div>
        </div>
        <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: TEXT, marginBottom: 4 }}>
          <span style={{ color: TEAL }}>{goalProgressPct}%</span> Complete
        </div>
        <div style={{ fontSize: 13, color: TEXT_SEC, marginBottom: 16 }}>
          {bodyweightStart} lbs → {bodyweightCurrent} lbs → <strong style={{ color: TEAL }}>{goalWeight} lbs goal</strong>
        </div>
        <div style={{ position: "relative", height: 14, borderRadius: 7, background: "#e8f0ee", marginBottom: 16, overflow: "hidden" }}>
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${goalProgressPct}%`, borderRadius: 7,
            background: `linear-gradient(90deg, ${TEAL}, ${MINT})`,
            transition: "width 1.5s cubic-bezier(0.16, 1, 0.3, 1)"
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: TEXT_SEC }}>
          <span>Start: {bodyweightStart} lbs</span>
          <span style={{ fontWeight: 700, color: TEAL }}>Now: {bodyweightCurrent} lbs</span>
          <span>Goal: {goalWeight} lbs</span>
        </div>
      </SectionCard>

      {/* ─── BODY COMPOSITION: INDIVIDUAL CHARTS ─── */}
      {(() => {
        const bodyCompMetrics = [
          { label: "Bodyweight", start: bodyweightStart, current: bodyweightCurrent, goal: goalWeight, unit: "lbs", color: TEAL, goodDir: "down", eta: "Week 10-12" },
          { label: "Body Fat", start: bodyFatStart, current: bodyFatCurrent, goal: Math.max(12, bodyFatStart - 8), unit: "%", color: "#3aafa9", goodDir: "down", eta: "Week 11-13" },
          { label: "Lean Mass", start: leanMassStart, current: leanMassCurrent, goal: leanMassStart + 8, unit: "lbs", color: MINT, goodDir: "up", eta: "Week 14-16" },
        ];

        const weeksTotal = 12;
        const weeksCurrent = 4;

        // Smooth curve builder
        const smooth = (pts) => {
          if (pts.length < 2) return "";
          let d = `M ${pts[0].x},${pts[0].y}`;
          for (let i = 0; i < pts.length - 1; i++) {
            const cp = (pts[i+1].x - pts[i].x) / 2.5;
            d += ` C ${pts[i].x+cp},${pts[i].y} ${pts[i+1].x-cp},${pts[i+1].y} ${pts[i+1].x},${pts[i+1].y}`;
          }
          return d;
        };

        return (
          <div style={{
            display: isMobile ? "flex" : "grid",
            gridTemplateColumns: isMobile ? undefined : "repeat(3, 1fr)",
            flexDirection: isMobile ? "column" : undefined,
            gap: isMobile ? 14 : 18
          }}>
            {bodyCompMetrics.map((m, idx) => {
          const cw = 380, ch = 160, pL = 44, pR = 20, pT = 24, pB = 32;
          const plotW = cw - pL - pR, plotH = ch - pT - pB;

          // Generate data
          const actual = [];
          for (let w = 0; w <= weeksCurrent; w++) {
            const t = w / weeksCurrent;
            const noise = Math.sin(w * 2.3 + idx) * 0.4;
            actual.push(m.start + (m.current - m.start) * t + noise);
          }
          const projected = [];
          for (let w = weeksCurrent; w <= weeksTotal; w++) {
            const t = (w - weeksCurrent) / (weeksTotal - weeksCurrent);
            const eased = t * t * 0.3 + t * 0.7;
            projected.push(m.current + (m.goal - m.current) * eased);
          }

          // Y-axis range
          const allVals = [...actual, ...projected, m.goal];
          const valMin = Math.min(...allVals) - Math.abs(m.goal - m.start) * 0.15;
          const valMax = Math.max(...allVals) + Math.abs(m.goal - m.start) * 0.15;

          const toY = (v) => pT + (1 - (v - valMin) / (valMax - valMin)) * plotH;
          const toX = (w) => pL + (w / weeksTotal) * plotW;

          const actualPts = actual.map((v, i) => ({ x: toX(i), y: toY(v) }));
          const projPts = projected.map((v, i) => ({ x: toX(weeksCurrent + i), y: toY(v) }));
          const lastPt = actualPts[actualPts.length - 1];
          const goalPt = projPts[projPts.length - 1];
          const startPt = actualPts[0];

          // Area under actual curve
          const areaPath = `${smooth(actualPts)} L ${lastPt.x},${pT + plotH} L ${startPt.x},${pT + plotH} Z`;

          const change = m.current - m.start;
          const isGood = (m.goodDir === "down" && change < 0) || (m.goodDir === "up" && change > 0);
          const progressPct = Math.min(100, Math.round((Math.abs(change) / Math.abs(m.goal - m.start)) * 100));

          return (
            <SectionCard key={idx} style={{ background: `linear-gradient(145deg, ${m.color}04, ${m.color}02, #fafcfb)` }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: TEXT }}>{m.label}</div>
                  <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 2 }}>
                    {m.start}{m.unit} → {m.current}{m.unit} → <strong style={{ color: m.color }}>{m.goal}{m.unit} goal</strong>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <div style={{
                    padding: "5px 12px", borderRadius: 14,
                    background: isGood ? `${ALERT_GREEN}12` : `${TEXT_SEC}10`,
                    color: isGood ? ALERT_GREEN : TEXT_SEC, fontSize: 12, fontWeight: 700
                  }}>
                    {change > 0 ? "+" : ""}{change.toFixed(1)}{m.unit}
                  </div>
                  <div style={{
                    padding: "5px 12px", borderRadius: 14,
                    background: `${m.color}12`, color: m.color, fontSize: 12, fontWeight: 700
                  }}>
                    {progressPct}% to goal
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div style={{ borderRadius: 14, background: WHITE, border: `1px solid ${BORDER}`, padding: isMobile ? "12px 8px" : "16px 12px", marginBottom: 14 }}>
                <svg width="100%" height={ch} viewBox={`0 0 ${cw} ${ch}`} preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
                  <defs>
                    <linearGradient id={`areaGrad${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={m.color} stopOpacity="0.15"/>
                      <stop offset="100%" stopColor={m.color} stopOpacity="0.02"/>
                    </linearGradient>
                  </defs>

                  {/* Y-axis grid + labels */}
                  {[0, 0.5, 1].map((t, i) => {
                    const v = valMin + t * (valMax - valMin);
                    const y = toY(v);
                    return (
                      <g key={i}>
                        <line x1={pL} y1={y} x2={cw - pR} y2={y} stroke={BORDER} strokeWidth="0.8"/>
                        <text x={pL - 6} y={y + 3} textAnchor="end" fill={TEXT_SEC} fontSize="10" fontWeight="600" fontFamily="DM Sans">
                          {m.unit === "%" ? v.toFixed(0) : Math.round(v)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Goal horizontal line */}
                  <line x1={pL} y1={toY(m.goal)} x2={cw - pR} y2={toY(m.goal)} stroke={m.color} strokeWidth="1.5" strokeDasharray="6,4" opacity="0.4"/>

                  {/* Week labels */}
                  {[0, weeksCurrent, weeksTotal].map((w, i) => (
                    <text key={i} x={toX(w)} y={ch - 8} textAnchor="middle" fill={w === weeksCurrent ? TEXT : TEXT_SEC} fontSize="10" fontWeight={w === weeksCurrent ? 700 : 600} fontFamily="DM Sans">
                      {w === 0 ? "Start" : w === weeksCurrent ? "Now" : `W${w}`}
                    </text>
                  ))}

                  {/* "Now" vertical line */}
                  <line x1={toX(weeksCurrent)} y1={pT} x2={toX(weeksCurrent)} y2={pT + plotH} stroke={TEXT_SEC} strokeWidth="1" strokeDasharray="4,4" opacity="0.35"/>

                  {/* Area fill */}
                  <path d={areaPath} fill={`url(#areaGrad${idx})`}/>

                  {/* Actual line */}
                  <path d={smooth(actualPts)} fill="none" stroke={m.color} strokeWidth="3" strokeLinecap="round"/>

                  {/* Projected line */}
                  <path d={smooth(projPts)} fill="none" stroke={m.color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="8,5" opacity="0.55"/>

                  {/* Data points on actual */}
                  {actualPts.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r={i === actualPts.length - 1 ? 6 : 3.5} fill={WHITE} stroke={m.color} strokeWidth={i === actualPts.length - 1 ? 3 : 2}/>
                  ))}

                  {/* Current glow */}
                  <circle cx={lastPt.x} cy={lastPt.y} r="12" fill={m.color} opacity="0.12"/>

                  {/* Goal endpoint */}
                  <circle cx={goalPt.x} cy={goalPt.y} r="8" fill={m.color} opacity="0.15"/>
                  <circle cx={goalPt.x} cy={goalPt.y} r="5" fill={m.color}/>

                  {/* Start label */}
                  <g>
                    <rect x={startPt.x - 18} y={startPt.y - 20} width="36" height="16" rx="8" fill={TEXT_SEC}/>
                    <text x={startPt.x} y={startPt.y - 9.5} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="DM Sans">{m.start}{m.unit === "%" ? "%" : ""}</text>
                  </g>

                  {/* Current label */}
                  <g>
                    <rect x={lastPt.x - 24} y={lastPt.y - 26} width="48" height="18" rx="9" fill={m.color}/>
                    <text x={lastPt.x} y={lastPt.y - 14} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily="DM Sans">{m.current}{m.unit}</text>
                  </g>

                  {/* Goal label */}
                  <g>
                    <rect x={goalPt.x - 24} y={goalPt.y + 10} width="48" height="18" rx="9" fill={m.color} opacity="0.85"/>
                    <text x={goalPt.x} y={goalPt.y + 22} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily="DM Sans">{m.goal}{m.unit}</text>
                  </g>
                </svg>
              </div>

              {/* Footer: ETA & Legend */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 16, height: 3, borderRadius: 2, background: m.color }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC }}>Actual</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 16, height: 0, borderTop: `2.5px dashed ${m.color}`, opacity: 0.6 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC }}>Projected</span>
                  </div>
                </div>
                <div style={{
                  padding: "6px 14px", borderRadius: 12, background: `${m.color}08`, border: `1px solid ${m.color}12`,
                  fontSize: 12, fontWeight: 700, color: TEXT
                }}>
                  Est. Goal: <span style={{ color: m.color }}>{m.eta}</span>
                </div>
              </div>
            </SectionCard>
          );
        })}
          </div>
        );
      })()}

      {/* ─── STRENGTH PROGRESS (BAR CHARTS) ─── */}
      {(() => {
        // Generate session history for each lift with progressive overload
        const generateLiftHistory = (baseline, liftIdx) => {
          const sessions = [];
          const sessionCount = 8 + (liftIdx % 3); // 8-10 sessions per lift
          const seed = client.name.charCodeAt(0) + liftIdx * 7;
          
          for (let i = 0; i < sessionCount; i++) {
            const progress = i / (sessionCount - 1);
            // Progressive increase with some variation
            const baseIncrease = progress * (baseline * 0.12); // ~12% total gain
            const variation = Math.sin(i * 1.7 + seed) * 3;
            const weight = Math.round(baseline + baseIncrease + variation);
            const reps = 5 + Math.floor(Math.random() * 3) - 1; // 4-7 reps
            const date = new Date();
            date.setDate(date.getDate() - (sessionCount - 1 - i) * 4); // Every ~4 days
            sessions.push({
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              weight,
              reps,
              e1rm: Math.round(weight * (36 / (37 - reps)))
            });
          }
          return sessions;
        };

        const liftData = [
          { name: "Squat", baseline: strengthBaselines.squat?.weight || 135, color: TEAL },
          { name: "Bench Press", baseline: strengthBaselines.benchPress?.weight || 95, color: MINT },
          { name: "Deadlift", baseline: strengthBaselines.deadlift?.weight || 185, color: "#3aafa9" },
        ].map((lift, idx) => ({
          ...lift,
          sessions: generateLiftHistory(lift.baseline, idx)
        }));

        return (
          <div style={{
            display: isMobile ? "flex" : "grid",
            gridTemplateColumns: isMobile ? undefined : "repeat(3, 1fr)",
            flexDirection: isMobile ? "column" : undefined,
            gap: isMobile ? 14 : 18
          }}>
            {liftData.map((lift, liftIdx) => {
          const sessions = lift.sessions;
          const maxE1RM = Math.max(...sessions.map(s => s.e1rm));
          const minE1RM = Math.min(...sessions.map(s => s.e1rm));
          const firstE1RM = sessions[0].e1rm;
          const lastE1RM = sessions[sessions.length - 1].e1rm;
          const totalGain = lastE1RM - firstE1RM;
          const gainPct = Math.round((totalGain / firstE1RM) * 100);

          const cw = 380, ch = 160, pL = 40, pR = 16, pT = 16, pB = 36;
          const plotW = cw - pL - pR, plotH = ch - pT - pB;
          const barWidth = Math.min(28, (plotW / sessions.length) - 6);
          const barGap = (plotW - barWidth * sessions.length) / (sessions.length - 1);

          const yMin = minE1RM - 10;
          const yMax = maxE1RM + 15;
          const toY = (v) => pT + (1 - (v - yMin) / (yMax - yMin)) * plotH;
          const toX = (i) => pL + i * (barWidth + barGap);

          return (
            <SectionCard key={liftIdx} style={{ background: `linear-gradient(155deg, ${lift.color}04, ${lift.color}02, #fafcfb)` }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: `${lift.color}12`,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={lift.color} strokeWidth="2.2" strokeLinecap="round">
                      <rect x="1" y="10" width="4" height="4" rx="1"/><rect x="19" y="10" width="4" height="4" rx="1"/>
                      <rect x="5" y="7" width="3" height="10" rx="1"/><rect x="16" y="7" width="3" height="10" rx="1"/>
                      <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: TEXT }}>{lift.name}</div>
                    <div style={{ fontSize: 13, color: TEXT_SEC }}>{sessions.length} sessions logged</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{
                    padding: "5px 12px", borderRadius: 14,
                    background: `${ALERT_GREEN}12`, color: ALERT_GREEN, fontSize: 12, fontWeight: 700
                  }}>
                    +{totalGain} lbs
                  </div>
                  <div style={{
                    padding: "5px 12px", borderRadius: 14,
                    background: `${lift.color}12`, color: lift.color, fontSize: 12, fontWeight: 700
                  }}>
                    +{gainPct}%
                  </div>
                </div>
              </div>

              {/* Current vs Starting */}
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1, padding: "12px 16px", borderRadius: 12, background: `${TEXT_SEC}08`, border: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: TEXT_SEC, textTransform: "uppercase", marginBottom: 4 }}>Starting 1RM</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: TEXT_SEC }}>{firstE1RM} <span style={{ fontSize: 13, fontWeight: 600 }}>lbs</span></div>
                </div>
                <div style={{ flex: 1, padding: "12px 16px", borderRadius: 12, background: `${lift.color}08`, border: `1px solid ${lift.color}15` }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: lift.color, textTransform: "uppercase", marginBottom: 4 }}>Current 1RM</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: lift.color }}>{lastE1RM} <span style={{ fontSize: 13, fontWeight: 600 }}>lbs</span></div>
                </div>
              </div>

              {/* Bar Chart */}
              <div style={{ borderRadius: 14, background: WHITE, border: `1px solid ${BORDER}`, padding: isMobile ? "12px 8px" : "16px 12px" }}>
                <svg width="100%" height={ch} viewBox={`0 0 ${cw} ${ch}`} preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
                  <defs>
                    <linearGradient id={`barGrad${liftIdx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={lift.color} stopOpacity="1"/>
                      <stop offset="100%" stopColor={lift.color} stopOpacity="0.7"/>
                    </linearGradient>
                  </defs>

                  {/* Y-axis grid lines */}
                  {[0, 0.5, 1].map((t, i) => {
                    const v = yMin + t * (yMax - yMin);
                    const y = toY(v);
                    return (
                      <g key={i}>
                        <line x1={pL - 4} y1={y} x2={cw - pR} y2={y} stroke={BORDER} strokeWidth="0.8"/>
                        <text x={pL - 8} y={y + 3} textAnchor="end" fill={TEXT_SEC} fontSize="10" fontWeight="600" fontFamily="DM Sans">
                          {Math.round(v)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Bars */}
                  {sessions.map((s, i) => {
                    const barH = toY(yMin) - toY(s.e1rm);
                    const x = toX(i);
                    const y = toY(s.e1rm);
                    const isLast = i === sessions.length - 1;
                    const isFirst = i === 0;
                    
                    return (
                      <g key={i}>
                        {/* Bar */}
                        <rect
                          x={x} y={y} width={barWidth} height={barH}
                          rx={4} ry={4}
                          fill={isLast ? lift.color : isFirst ? `${lift.color}50` : `${lift.color}${Math.round(50 + (i / sessions.length) * 50).toString(16).padStart(2, '0')}`}
                        />
                        {/* Value label on last bar */}
                        {isLast && (
                          <g>
                            <rect x={x + barWidth/2 - 18} y={y - 20} width="36" height="16" rx="8" fill={lift.color}/>
                            <text x={x + barWidth/2} y={y - 9} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily="DM Sans">{s.e1rm}</text>
                          </g>
                        )}
                        {/* Date label */}
                        <text x={x + barWidth/2} y={ch - 8} textAnchor="middle" fill={TEXT_SEC} fontSize="9" fontWeight="500" fontFamily="DM Sans">
                          {i === 0 || i === sessions.length - 1 || i === Math.floor(sessions.length / 2) ? s.date.split(' ')[0] : ''}
                        </text>
                      </g>
                    );
                  })}

                  {/* Trend line */}
                  {(() => {
                    const pts = sessions.map((s, i) => ({ x: toX(i) + barWidth / 2, y: toY(s.e1rm) }));
                    const smooth = (points) => {
                      if (points.length < 2) return "";
                      let d = `M ${points[0].x},${points[0].y}`;
                      for (let i = 0; i < points.length - 1; i++) {
                        const cp = (points[i+1].x - points[i].x) / 2.5;
                        d += ` C ${points[i].x+cp},${points[i].y} ${points[i+1].x-cp},${points[i+1].y} ${points[i+1].x},${points[i+1].y}`;
                      }
                      return d;
                    };
                    return <path d={smooth(pts)} fill="none" stroke={lift.color} strokeWidth="2" strokeLinecap="round" opacity="0.4" strokeDasharray="4,3"/>;
                  })()}
                </svg>
              </div>

              {/* Session Details Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                <div style={{ fontSize: 12, color: TEXT_SEC }}>
                  <span style={{ fontWeight: 600 }}>Best Set:</span> {sessions[sessions.length - 1].weight} lbs x {sessions[sessions.length - 1].reps}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 12, height: 3, borderRadius: 2, background: lift.color, opacity: 0.4 }} />
                  <span style={{ fontSize: 11, color: TEXT_SEC }}>Est. 1RM trend</span>
                </div>
              </div>
            </SectionCard>
          );
        })}
          </div>
        );
      })()}

      {/* ─── ACHIEVEMENTS & STREAKS ─── */}
      <SectionCard style={{ background: `linear-gradient(140deg, #f9f7f3, #f5f3ef, #faf8f5)` }}>
        <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Achievements & Streaks</div>
        <div style={{ fontSize: 13, color: TEXT_SEC, marginBottom: 18 }}>Milestones and consistency rewards</div>
        
        {/* Streaks */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <div style={{
            flex: 1, padding: "18px 16px", borderRadius: 16,
            background: `linear-gradient(135deg, ${TEAL}08, ${TEAL}04)`,
            border: `1px solid ${TEAL}15`, textAlign: "center"
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: TEXT_SEC, textTransform: "uppercase", marginBottom: 6 }}>Current Streak</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: TEAL }}>{currentStreak}</div>
            <div style={{ fontSize: 12, color: TEXT_SEC }}>sessions</div>
          </div>
          <div style={{
            flex: 1, padding: "18px 16px", borderRadius: 16,
            background: `linear-gradient(135deg, ${MINT}08, ${MINT}04)`,
            border: `1px solid ${MINT}15`, textAlign: "center"
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: TEXT_SEC, textTransform: "uppercase", marginBottom: 6 }}>Best Streak</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: MINT }}>{bestStreak}</div>
            <div style={{ fontSize: 12, color: TEXT_SEC }}>sessions</div>
          </div>
        </div>

        {/* Achievements */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: 10 }}>
          {achievements.map((a, i) => {
            const icons = {
              check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>,
              fire: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2c0 4-4 6-4 10a4 4 0 008 0c0-4-4-6-4-10z"/></svg>,
              trophy: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 22V12"/><path d="M14 22V12"/><rect x="6" y="2" width="12" height="10" rx="2"/></svg>,
              muscle: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="10" width="4" height="4" rx="1"/><rect x="19" y="10" width="4" height="4" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
              star: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>,
              apple: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3Q13 2 14.5 3 Q13 4 12 5.5"/><path d="M12 5.5 Q7 5 5 9 Q3 13 5 17 Q7 21 12 21 Q17 21 19 17 Q21 13 19 9 Q17 5 12 5.5Z"/></svg>,
            };
            return (
              <div key={i} style={{
                padding: "14px 12px", borderRadius: 14,
                background: a.earned ? `linear-gradient(135deg, ${ALERT_GREEN}08, ${ALERT_GREEN}04)` : "#f8f9f8",
                border: `1px solid ${a.earned ? `${ALERT_GREEN}20` : BORDER}`,
                textAlign: "center", opacity: a.earned ? 1 : 0.5
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, margin: "0 auto 8px",
                  background: a.earned ? `${ALERT_GREEN}15` : "#e8f0ee",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: a.earned ? ALERT_GREEN : TEXT_SEC
                }}>
                  {icons[a.icon]}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: a.earned ? TEXT : TEXT_SEC, marginBottom: 2 }}>{a.name}</div>
                <div style={{ fontSize: 10, color: TEXT_SEC }}>{a.earned ? a.date : "Locked"}</div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ─── THIS WEEK'S FOCUS ─── */}
      <SectionCard style={{ background: `linear-gradient(140deg, #f2faf8, #eaf6f2, #f0f9f5)`, border: `1px solid rgba(43,122,120,0.12)` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
          This Week's Focus
        </div>
        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: TEXT, lineHeight: 1.4 }}>
          {client.coachAngle}
        </div>
      </SectionCard>

      {/* ─── Share / Export ─── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <div onClick={() => setShowShare(true)} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "14px 18px",
          borderRadius: 14, cursor: "pointer", fontSize: 14, fontWeight: 600,
          background: TEAL, color: "#fff", boxShadow: "0 2px 8px rgba(43,122,120,0.3)",
          minWidth: 160
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M22 2L11 13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
          Share with {client.name.split(" ")[0]}
        </div>
        <div onClick={handleExportPDF} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "14px 18px",
          borderRadius: 14, cursor: "pointer", fontSize: 14, fontWeight: 600,
          background: WHITE, color: TEXT, border: `1px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          minWidth: 160
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export PDF
        </div>
      </div>

      {/* ═══ SHARE MODAL ═══ */}
      {showShare && (<>
        <div onClick={() => setShowShare(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200 }} />
        <div style={{
          position: "fixed",
          top: isMobile ? "auto" : "50%", bottom: isMobile ? 0 : "auto",
          left: isMobile ? 0 : "50%", transform: isMobile ? "none" : "translate(-50%, -50%)",
          width: isMobile ? "100%" : 440, maxHeight: isMobile ? "85vh" : "auto",
          background: WHITE, borderRadius: isMobile ? "24px 24px 0 0" : 24,
          zIndex: 210, padding: isMobile ? "24px 20px 32px" : "28px 32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: `1px solid ${BORDER}`,
          display: "flex", flexDirection: "column", gap: 18
        }}>
          {/* Drag handle mobile */}
          {isMobile && <div style={{ width: 36, height: 4, borderRadius: 2, background: BORDER, margin: "0 auto 4px" }} />}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>Share Report</div>
              <div style={{ fontSize: 13, color: TEXT_SEC }}>Send {client.name.split(" ")[0]}'s progress report</div>
            </div>
            <div onClick={() => setShowShare(false)} style={{
              width: 32, height: 32, borderRadius: 8, background: "#f0f4f3",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: TEXT_SEC
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
          </div>

          {/* Link */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Report Link</div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{
                flex: 1, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${BORDER}`,
                fontSize: 13, color: TEXT, background: "#f8faf9", overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap"
              }}>{shareLink}</div>
              <div onClick={handleCopyLink} style={{
                padding: "10px 16px", borderRadius: 10, cursor: "pointer",
                fontSize: 13, fontWeight: 600,
                background: linkCopied ? ALERT_GREEN : TEAL, color: "#fff",
                display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
                transition: "all 0.2s ease", boxShadow: "0 2px 6px rgba(43,122,120,0.2)"
              }}>
                {linkCopied ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>Copied</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy</>
                )}
              </div>
            </div>
          </div>

          {/* Share options */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Send Via</div>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { label: "Email", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="3"/><polyline points="22,4 12,13 2,4"/></svg>, color: TEAL,
                  action: () => window.open(`mailto:?subject=${encodeURIComponent(`${client.name}'s Progress Report - Milton`)}&body=${encodeURIComponent(`Hi ${client.name.split(" ")[0]},\n\nHere's your latest progress report from Milton:\n\n${shareLink}\n\nKeep up the great work!`)}`) },
                { label: "Text", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>, color: "#3aafa9",
                  action: () => window.open(`sms:?body=${encodeURIComponent(`Check out your Milton progress report: ${shareLink}`)}`) },
                { label: "WhatsApp", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>, color: "#25D366",
                  action: () => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out your Milton progress report: ${shareLink}`)}`) },
              ].map((opt, i) => (
                <div key={i} onClick={opt.action} style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: "14px 10px", borderRadius: 14, cursor: "pointer",
                  background: "#f8faf9", border: `1px solid ${BORDER}`,
                  transition: "all 0.15s ease"
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = opt.color; e.currentTarget.style.background = `${opt.color}08`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = "#f8faf9"; }}
                >
                  <div style={{ color: opt.color }}>{opt.icon}</div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{opt.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Also export */}
          <div onClick={() => { setShowShare(false); handleExportPDF(); }} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "12px 18px", borderRadius: 12, cursor: "pointer",
            fontSize: 13, fontWeight: 600, color: TEXT_SEC,
            background: "#f8faf9", border: `1px solid ${BORDER}`
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Or export as PDF instead
          </div>
        </div>
      </>)}
    </div>
  );
}

/* ─── Data Card Period Tabs ─── */
function DataCardPeriods({ periods, color, isMobile }) {
  const [activePeriod, setActivePeriod] = useState(0);
  const p = periods[activePeriod];
  return (
    <div style={{ padding: "12px 16px 16px" }}>
      {/* Period tabs */}
      <div style={{ display: "flex", gap: 4, background: "#f0f4f3", borderRadius: 8, padding: 3, marginBottom: 14 }}>
        {periods.map((pr, i) => (
          <div key={i} onClick={() => setActivePeriod(i)} style={{
            flex: 1, textAlign: "center", padding: "6px 4px", borderRadius: 6, cursor: "pointer",
            background: activePeriod === i ? WHITE : "transparent",
            color: activePeriod === i ? TEXT : TEXT_SEC,
            fontSize: 11, fontWeight: activePeriod === i ? 700 : 500,
            boxShadow: activePeriod === i ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.2s ease"
          }}>{pr.label}</div>
        ))}
      </div>
      {/* Data grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {p.rows.map((row, ri) => {
          const hasGoal = row.g !== undefined && row.g !== null;
          const numVal = parseFloat(String(row.v).replace(/[^0-9.]/g, ""));
          const numGoal = hasGoal ? parseFloat(String(row.g).replace(/[^0-9.]/g, "")) : 0;
          const pct = hasGoal && numGoal > 0 ? Math.min(100, (numVal / numGoal) * 100) : 0;
          const met = hasGoal && pct >= 95;
          const close = hasGoal && pct >= 80 && pct < 95;
          return (
            <div key={ri} style={{ padding: "8px 10px", borderRadius: 10, background: `${color}06` }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.04em" }}>{row.l}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginTop: 3 }}>{row.v}</div>
              {hasGoal && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                    <div style={{ fontSize: 10, color: met ? ALERT_GREEN : close ? "#d4a63c" : TEXT_SEC, fontWeight: 600 }}>
                      Goal: {row.g}
                    </div>
                    {met && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={ALERT_GREEN} strokeWidth="3" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>}
                  </div>
                  <div style={{ width: "100%", height: 3, borderRadius: 2, background: "#e8f0ee", marginTop: 3 }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: met ? ALERT_GREEN : close ? "#d4a63c" : color, transition: "width 0.6s ease" }} />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   CLIENT PROFILE SCREEN
   ═════════════════════════════════════════════ */
function ClientProfile({ client, onBack, isMobile, onReportOpen, reportBlocks, setReportBlocks }) {
  const [showReport, setShowReport] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState("coach"); // "coach" | "client"
  const [selectedDay, setSelectedDay] = useState(16);
  const [expandedSession, setExpandedSession] = useState(null);
  const [completedSessions, setCompletedSessions] = useState([]);
  const sessionsScrollRef = useRef(null);
  const [customizeMode, setCustomizeMode] = useState(false);
  const [coachNoteText, setCoachNoteText] = useState("");
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [selectedCalDay, setSelectedCalDay] = useState(null);
  const [workoutExpanded, setWorkoutExpanded] = useState(false);
  const [nutritionExpanded, setNutritionExpanded] = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [breakdownPeriod, setBreakdownPeriod] = useState(0); // 0: Today, 1: Last 7 Days, 2: Last 30 Days
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const wData = client.weightData || [0,0,0,0,0,0,0,0];
  const wMin = Math.min(...wData) - 1;
  const wMax = Math.max(...wData) + 1;
  const wRange = wMax - wMin || 1;
  const font = `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif`;

  // Training-focused calculations
  const totalSessions = client.totalSessions || 0;
  const sessionsThisWeek = client.sessionsThisWeek || 0;
  const sessionsPerWeek = client.sessionsPerWeek || 3;
  const currentStreak = client.streak?.current || 0;
  const bestStreak = client.streak?.best || 0;
  
  // Calculate days since assessment
  const assessmentDate = client.assessment?.date ? new Date(client.assessment.date) : null;
  const daysSinceAssessment = assessmentDate ? Math.floor((new Date() - assessmentDate) / (1000 * 60 * 60 * 24)) : 0;
  
  // Body comp changes
  const weightChange = client.assessment && client.current ? (client.current.bodyweight - client.assessment.bodyweight).toFixed(1) : 0;
  const bodyFatChange = client.assessment && client.current ? (client.current.bodyFat - client.assessment.bodyFat).toFixed(1) : 0;
  const leanMassChange = client.assessment && client.current ? (client.current.leanMass - client.assessment.leanMass).toFixed(1) : 0;
  
  // Get last session
  const lastSession = client.sessions?.[0] || null;
  
  // Attendance rate based on session attendance
  const attendanceRate = client.attendanceRate || 75;
  const scoreColor = attendanceRate >= 80 ? MINT : attendanceRate >= 60 ? SAGE : "#ef6c3e";
  
  // Backward compatibility for old nutrition-based scores
  const mealsScore = Math.min(100, Math.round(((client.nutrition?.proteinAvg || 0) / (client.nutrition?.proteinTarget || 100)) * 100)) || 50;
  const exerciseScore = Math.min(100, (totalSessions / Math.max(1, daysSinceAssessment / 7) / sessionsPerWeek) * 100) || 50;
  const movementScore = 70;
  const sleepScore = 78;
  const consistencyScore = attendanceRate;

  const ovPillars = [
    { key: "exercise", label: "Exercise", days: Math.min(30, client.workoutDays * 4 + 2), color: TEAL, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="1" y="10" width="4" height="4" rx="1"/><rect x="19" y="10" width="4" height="4" rx="1"/><rect x="5" y="7" width="3" height="10" rx="1"/><rect x="16" y="7" width="3" height="10" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
    { key: "steps", label: "Steps", days: Math.min(30, Math.round(client.steps / 350)), color: "#3aafa9", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18 Q3 12 6 9 Q8 7 9 8 L11 11 Q12 12.5 14 12.5 L18 12.5 Q21 13 21 16 L21 17 Q21 19 19 19 L5 19 Q3 19 3 18Z"/><line x1="8" y1="19" x2="8" y2="16"/><line x1="12" y1="19" x2="12" y2="16"/><line x1="16" y1="19" x2="16" y2="16"/></svg> },
    { key: "meals", label: "Meals", days: Math.min(30, client.mealsLogged + 5), color: "#ef6c3e", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3Q13 2 14.5 3 Q13 4 12 5.5"/><path d="M12 5.5 Q7 5 5 9 Q3 13 5 17 Q7 21 11.5 21 Q12 20 12.5 21 Q17 21 19 17 Q21 13 19 9 Q17 5 12 5.5Z"/></svg> },
    { key: "sleep", label: "Sleep", days: Math.min(30, 21), color: "#8e7cc3", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg> },
  ];

  const dayNames = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const calDays = Array.from({ length: 28 }).map((_, i) => {
    const seed = (i * 7 + client.name.charCodeAt(0)) % 100;
    const ex = seed < exerciseScore, st = seed < movementScore + 5, ml = seed < mealsScore - 5, sl = seed < sleepScore + 3;
    const weekNum = Math.floor(i / 7) + 1;
    const dayLabel = dayNames[i % 7];
    return {
      exercise: ex, steps: st, meals: ml, sleep: sl,
      label: `Week ${weekNum}, ${dayLabel}`,
      details: {
        exercise: ex ? { type: ["Strength","HIIT","Cardio","Yoga"][i%4], duration: `${35 + (i%4)*8} min`, intensity: ["Moderate","High","Low","Moderate"][i%4] } : null,
        steps: st ? { count: (5000 + (seed * 73) % 7000).toLocaleString(), distance: `${(2 + (seed%30)/10).toFixed(1)} mi`, active: `${25 + seed%30} min` } : null,
        meals: ml ? {
          logged: [2,3,3,2,3,1,2][i%7],
          calories: (1300 + (seed*11)%500),
          protein: `${client.proteinAvg - 10 + (i%5)*5}g`,
          carbs: `${Math.round(client.proteinAvg * 1.6 + (i%3)*10)}g`,
          fats: `${Math.round(client.proteinAvg * 0.5 + (i%4)*3)}g`,
          water: `${48 + (i%5)*8} oz`
        } : null,
        sleep: sl ? { duration: `${6 + (seed%20)/10} hrs`, bedtime: ["10:30 PM","11:15 PM","10:45 PM","11:30 PM","10:00 PM"][i%5], quality: ["Good","Fair","Great","Good","Fair"][i%5] } : null,
      }
    };
  });

  const StatCard = ({ label, value, sub, children }) => (
    <div style={{
      background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`,
      padding: isMobile ? "14px" : "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
      display: "flex", flexDirection: "column", gap: 4
    }}>
      <span style={{ fontSize: 11, color: TEXT_SEC, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ fontSize: isMobile ? 24 : 30, fontWeight: 700, color: TEXT, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: TEXT_SEC, fontWeight: 500 }}>{sub}</span>}
      {children}
    </div>
  );

  const ActionBtn = ({ label, primary, icon, onClick, disabled }) => (
    <div onClick={disabled ? undefined : onClick} style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: isMobile ? "10px 14px" : "10px 18px",
      borderRadius: 12, cursor: disabled ? "default" : "pointer", fontSize: 13, fontWeight: 600,
      background: disabled ? "#eef0ee" : primary ? TEAL : WHITE,
      color: disabled ? "#b0b8b4" : primary ? "#fff" : TEXT,
      border: primary ? "none" : `1px solid ${disabled ? "#dde2e0" : BORDER}`,
      boxShadow: disabled ? "none" : primary ? "0 2px 8px rgba(43,122,120,0.3)" : "0 1px 3px rgba(0,0,0,0.04)",
      whiteSpace: "nowrap", transition: "all 0.15s ease",
      opacity: disabled ? 0.7 : 1
    }}>
      {icon}{label}
    </div>
  );

  const handleEditBlock = (blockId, label) => {
    // Pre-fill chat context for this block
  };
  const handleRemoveBlock = (blockId) => {
    setReportBlocks(prev => prev.filter(b => b !== blockId));
  };
  const handleAddBlock = (blockId) => {
    setReportBlocks(prev => prev.includes(blockId) ? prev : [...prev, blockId]);
  };

  const availableBlocks = [
    { id: "top3", label: "Score & Charts", icon: "grid" },
    { id: "rule30", label: "Rule of 30", icon: "layers" },
    { id: "dataCards", label: "Data Cards", icon: "grid" },
    { id: "calendar", label: "Daily Activity", icon: "grid" },
    { id: "insight", label: "Milton Insight", icon: "message" },
    { id: "nutrition", label: "Nutrition Breakdown", icon: "layers" },
    { id: "focus", label: "Focus Areas", icon: "file-text" },
    { id: "coachNotes", label: "Coach Notes", icon: "file-text" },
  ];
  const hiddenBlocks = availableBlocks.filter(b => !reportBlocks.includes(b.id));

  if (showReport) {
    return <ReportView client={client} onBack={() => setShowReport(false)} isMobile={isMobile} autoOpenShare={true} />;
  }

  return (
    <div style={{
      flex: 1, overflowY: "auto",
      padding: isMobile ? "68px 14px 76px" : "24px 28px",
      display: "flex", flexDirection: "column", gap: isMobile ? 14 : 18
    }}>
      {/* Back */}
      {!isMobile && <div onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
        color: TEXT_SEC, fontSize: 14, fontWeight: 600, width: "fit-content"
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        Back to Dashboard
      </div>}

      {/* ─── HEADER CARD ─── */}
      <div style={{
        background: WHITE, borderRadius: 20, border: `1px solid ${BORDER}`,
        padding: isMobile ? "18px" : "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}>
        <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 16 }}>
            <Avatar name={client.name} size={isMobile ? 48 : 56} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h2 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>{client.name}</h2>
                <div style={{ padding: "4px 10px", borderRadius: 10, background: `${TEAL}12`, color: TEAL, fontSize: 12, fontWeight: 600 }}>{client.program || "General Fitness"}</div>
                {currentStreak > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 10, background: `${MINT}12`, color: MINT, fontSize: 12, fontWeight: 600 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    {currentStreak} streak
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowReport(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: isMobile ? "10px 16px" : "12px 20px", borderRadius: 12,
              background: TEAL, color: WHITE, border: "none",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              boxShadow: `0 2px 8px ${TEAL}40`, transition: "all 0.2s ease"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Generate Report
          </button>
        </div>

        {/* Stat chips row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 12, background: "#f7faf9", border: `1px solid ${BORDER}` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{sessionsThisWeek}/{sessionsPerWeek}</span>
            <span style={{ fontSize: 12, color: TEXT_SEC }}>this week</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 12, background: "#f7faf9", border: `1px solid ${BORDER}` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round">
              <rect x="1" y="10" width="4" height="4" rx="1"/><rect x="19" y="10" width="4" height="4" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{totalSessions}</span>
            <span style={{ fontSize: 12, color: TEXT_SEC }}>total sessions</span>
          </div>
        </div>

        {/* Goal progress bar */}
        {(() => {
          const goals = client.goals || {};
          const current = client.current || {};
          const assessment = client.assessment || {};
          const goalLabel = goals.primary || "Lose 20 lbs";
          const startWeight = assessment.bodyweight || 175;
          const currentWeight = current.bodyweight || 170;
          const targetWeight = goals.targetWeight || 155;
          const totalChange = Math.abs(targetWeight - startWeight);
          const progressChange = Math.abs(currentWeight - startWeight);
          const progressPct = totalChange > 0 ? Math.min(100, Math.round((progressChange / totalChange) * 100)) : 0;
          
          return (
            <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 14, background: `linear-gradient(135deg, ${TEAL}06, ${MINT}04)`, border: `1px solid ${TEAL}15` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{goalLabel}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: TEAL }}>{progressPct}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: "#e8f0ee", overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${TEAL}, ${MINT})`, width: `${progressPct}%`, transition: "width 0.8s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: TEXT_SEC }}>
                <span>{startWeight} lbs</span>
                <span style={{ fontWeight: 600, color: TEXT }}>{currentWeight} lbs</span>
                <span>{targetWeight} lbs</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ─── 2. UPCOMING SESSIONS ─── */}
      {(() => {
        const today = new Date();
        const upcomingSessions = [
          { 
            id: 1,
            day: "Today", 
            type: "Upper Body", 
            time: "6:00 PM", 
            isToday: true,
            date: new Date(),
            exercises: [
              { name: "Barbell Bench Press", sets: 4, reps: "8, 8, 6, 6", weight: "155 lb" },
              { name: "Incline Dumbbell Press", sets: 3, reps: "10, 10, 8", weight: "50 lb" },
              { name: "Barbell Shoulder Press", sets: 3, reps: "8, 8, 8", weight: "95 lb" },
              { name: "Lateral Raises", sets: 3, reps: "12, 12, 10", weight: "20 lb" },
            ]
          },
          { 
            id: 2,
            day: "Wed", 
            type: "Lower Body", 
            time: "7:00 AM", 
            isToday: false,
            date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
            exercises: [
              { name: "Barbell Full Squat", sets: 4, reps: "8, 8, 6, 6", weight: "185 lb" },
              { name: "Romanian Deadlift", sets: 3, reps: "10, 10, 8", weight: "135 lb" },
              { name: "Leg Press", sets: 3, reps: "12, 12, 10", weight: "270 lb" },
              { name: "Leg Curl", sets: 3, reps: "12, 10, 10", weight: "80 lb" },
            ]
          },
          { 
            id: 3,
            day: "Fri", 
            type: "Full Body", 
            time: "6:00 PM", 
            isToday: false,
            date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
            exercises: [
              { name: "Barbell Deadlift", sets: 3, reps: "10-12 reps", weight: "185 lb" },
              { name: "Pull-ups", sets: 3, reps: "8-10 reps", weight: "BW" },
              { name: "Dumbbell Lunges", sets: 3, reps: "10 each leg", weight: "40 lb" },
              { name: "Dumbbell Rows", sets: 3, reps: "10, 10, 8", weight: "50 lb" },
            ]
          },
        ];
        
        const scrollSessions = (direction) => {
          if (sessionsScrollRef.current) {
            const scrollAmount = 200;
            sessionsScrollRef.current.scrollBy({
              left: direction === 'left' ? -scrollAmount : scrollAmount,
              behavior: 'smooth'
            });
          }
        };
        
        return (
          <div style={{
            background: WHITE, borderRadius: 20, border: `1px solid ${BORDER}`,
            padding: isMobile ? "18px" : "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, color: TEXT }}>Upcoming Sessions</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => scrollSessions('left')}
                  style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: "#f0f4f3", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: TEXT_SEC,
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = TEAL_LIGHT; e.currentTarget.style.color = TEAL; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#f0f4f3"; e.currentTarget.style.color = TEXT_SEC; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="15,18 9,12 15,6"/>
                  </svg>
                </button>
                <button
                  onClick={() => scrollSessions('right')}
                  style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: "#f0f4f3", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: TEXT_SEC,
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = TEAL_LIGHT; e.currentTarget.style.color = TEAL; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#f0f4f3"; e.currentTarget.style.color = TEXT_SEC; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9,6 15,12 9,18"/>
                  </svg>
                </button>
              </div>
            </div>
            <div 
              ref={sessionsScrollRef}
              style={{ 
                display: "flex", gap: 12, overflowX: "auto", 
                padding: "4px 2px 8px 2px",
                scrollbarWidth: "none", msOverflowStyle: "none"
              }}
              className="hide-scrollbar"
            >
              {upcomingSessions.map((session, i) => {
                const isCompleted = completedSessions.includes(session.id);
                return (
                <div 
                  key={i} 
                  onClick={() => setExpandedSession(session)}
                  style={{
                    flex: "0 0 auto", minWidth: isMobile ? 140 : 160,
                    padding: "16px", borderRadius: 14,
                    background: isCompleted ? `${MINT}15` : (session.isToday ? `linear-gradient(135deg, ${TEAL}12, ${MINT}08)` : "#f7faf9"),
                    border: isCompleted ? `2px solid ${MINT}` : (session.isToday ? `2px solid ${TEAL}` : `1px solid ${BORDER}`),
                    boxShadow: session.isToday ? `0 4px 12px ${TEAL}15` : "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    position: "relative"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = session.isToday ? `0 4px 12px ${TEAL}15` : "none"; }}
                >
                  {isCompleted && (
                    <div style={{ 
                      position: "absolute", top: 8, right: 8,
                      width: 20, height: 20, borderRadius: "50%",
                      background: MINT, display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="3" strokeLinecap="round">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                    </div>
                  )}
                  <div style={{ fontSize: 12, fontWeight: 700, color: isCompleted ? MINT : (session.isToday ? TEAL : TEXT_SEC), textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                    {isCompleted ? "Completed" : session.day}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 4 }}>{session.type}</div>
                  <div style={{ fontSize: 13, color: TEXT_SEC }}>{session.time}</div>
                </div>
              )})}
            </div>
            
            {/* Expanded Session Modal */}
            {expandedSession && (
              <div 
                onClick={() => setExpandedSession(null)}
                style={{
                  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                  background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 1000, padding: 20
                }}
              >
                <div 
                  onClick={e => e.stopPropagation()}
                  style={{
                    background: WHITE, borderRadius: 20, width: "100%", maxWidth: 480,
                    maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
                  }}
                >
                  {/* Modal Header */}
                  <div style={{ 
                    padding: "20px 24px", borderBottom: `1px solid ${BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between"
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: expandedSession.isToday ? TEAL : TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                        {expandedSession.day} at {expandedSession.time}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>{expandedSession.type}</div>
                    </div>
                    <div 
                      onClick={() => setExpandedSession(null)}
                      style={{
                        width: 32, height: 32, borderRadius: 8, background: "#f0f4f3",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer"
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_SEC} strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Exercises List */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                      {expandedSession.exercises?.length || 0} Exercises
                    </div>
                    {expandedSession.exercises?.map((exercise, idx) => (
                      <div 
                        key={idx}
                        style={{
                          padding: "14px 16px", borderRadius: 12,
                          background: "#f7faf9", border: `1px solid ${BORDER}`,
                          marginBottom: 10
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 8, background: TEAL_LIGHT,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, color: TEAL, flexShrink: 0
                          }}>
                            {exercise.sets}x
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 4 }}>{exercise.name}</div>
                            <div style={{ fontSize: 12, color: TEXT_SEC }}>
                              {exercise.reps} · {exercise.weight}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Mark Complete Button */}
                  <div style={{ padding: "16px 24px", borderTop: `1px solid ${BORDER}` }}>
                    {completedSessions.includes(expandedSession.id) ? (
                      <button
                        onClick={() => {
                          setCompletedSessions(prev => prev.filter(id => id !== expandedSession.id));
                        }}
                        style={{
                          width: "100%", padding: "14px 20px", borderRadius: 12,
                          background: "#f0f4f3", border: `1px solid ${BORDER}`,
                          color: TEXT_SEC, fontSize: 14, fontWeight: 600,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                          <path d="M3 3v5h5"/>
                        </svg>
                        Undo Completion
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setCompletedSessions(prev => [...prev, expandedSession.id]);
                          setExpandedSession(null);
                        }}
                        style={{
                          width: "100%", padding: "14px 20px", borderRadius: 12,
                          background: TEAL, border: "none",
                          color: WHITE, fontSize: 14, fontWeight: 600,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          boxShadow: `0 4px 12px ${TEAL}40`,
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#3d7a6e"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = TEAL; e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="20,6 9,17 4,12"/>
                        </svg>
                        Mark as Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ─── 30 DAY ACTIVITY CALENDAR ─── */}
      {(() => {
        const today = new Date();
        const calendarDays = Array.from({ length: 30 }).map((_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() - (29 - i));
          const seed = (i * 7 + client.name.charCodeAt(0)) % 100;
          const dayOfWeek = date.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          
          const hasWorkout = seed < (isWeekend ? 40 : 65);
          const hasMeals = seed < 75;
          const hasSleep = seed < 80;
          const hasSteps = seed < 70;
          
          // Generate detailed meals for the day
          const generateMeals = () => {
            const mealTypes = [
              { type: "Breakfast", time: "7:30 AM", items: [
                { name: "Greek Yogurt with Berries", calories: 180, protein: 15, carbs: 22, fat: 4 },
                { name: "Scrambled Eggs (2)", calories: 180, protein: 14, carbs: 2, fat: 12 },
                { name: "Oatmeal with Banana", calories: 280, protein: 8, carbs: 52, fat: 5 },
                { name: "Protein Smoothie", calories: 320, protein: 28, carbs: 38, fat: 6 },
                { name: "Avocado Toast", calories: 290, protein: 8, carbs: 28, fat: 18 },
              ]},
              { type: "Lunch", time: "12:30 PM", items: [
                { name: "Grilled Chicken Salad", calories: 420, protein: 38, carbs: 18, fat: 22 },
                { name: "Turkey Wrap", calories: 380, protein: 28, carbs: 35, fat: 14 },
                { name: "Salmon Bowl", calories: 520, protein: 35, carbs: 45, fat: 20 },
                { name: "Quinoa Buddha Bowl", calories: 450, protein: 18, carbs: 55, fat: 16 },
                { name: "Chicken Burrito Bowl", calories: 580, protein: 42, carbs: 48, fat: 22 },
              ]},
              { type: "Dinner", time: "6:30 PM", items: [
                { name: "Grilled Steak with Vegetables", calories: 520, protein: 45, carbs: 15, fat: 32 },
                { name: "Baked Salmon with Rice", calories: 480, protein: 38, carbs: 35, fat: 18 },
                { name: "Chicken Stir-Fry", calories: 420, protein: 35, carbs: 32, fat: 16 },
                { name: "Pasta with Meat Sauce", calories: 620, protein: 32, carbs: 68, fat: 22 },
                { name: "Shrimp Tacos", calories: 450, protein: 28, carbs: 38, fat: 20 },
              ]},
              { type: "Snacks", time: "Various", items: [
                { name: "Protein Bar", calories: 220, protein: 20, carbs: 22, fat: 8 },
                { name: "Mixed Nuts (1 oz)", calories: 170, protein: 5, carbs: 6, fat: 15 },
                { name: "Apple with Almond Butter", calories: 195, protein: 4, carbs: 26, fat: 9 },
                { name: "Cottage Cheese", calories: 110, protein: 14, carbs: 5, fat: 4 },
                { name: "Hummus with Carrots", calories: 130, protein: 4, carbs: 14, fat: 7 },
              ]},
            ];
            
            const meals = [];
            mealTypes.forEach((mealType, idx) => {
              const mealSeed = (seed + idx * 17) % 100;
              if (mealSeed < 85) { // 85% chance of having this meal
                const itemIndex = (seed + idx * 7) % mealType.items.length;
                meals.push({
                  type: mealType.type,
                  time: mealType.time,
                  ...mealType.items[itemIndex]
                });
              }
            });
            
            const totals = meals.reduce((acc, m) => ({
              calories: acc.calories + m.calories,
              protein: acc.protein + m.protein,
              carbs: acc.carbs + m.carbs,
              fat: acc.fat + m.fat
            }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
            
            return { meals, totals };
          };
          
          const nutritionData = hasMeals ? generateMeals() : null;
          
          // Generate detailed workout data
          const generateWorkout = () => {
            const workoutType = ["Strength", "Cardio", "HIIT", "Mobility"][i % 4];
            const exercisesByType = {
              Strength: [
                { name: "Back Squat", sets: [{ reps: 8, weight: 135 }, { reps: 6, weight: 155 }, { reps: 6, weight: 165 }, { reps: 4, weight: 175 }] },
                { name: "Bench Press", sets: [{ reps: 10, weight: 95 }, { reps: 8, weight: 105 }, { reps: 6, weight: 115 }] },
                { name: "Deadlift", sets: [{ reps: 5, weight: 185 }, { reps: 5, weight: 205 }, { reps: 3, weight: 225 }] },
                { name: "Barbell Row", sets: [{ reps: 10, weight: 95 }, { reps: 8, weight: 105 }, { reps: 8, weight: 105 }] },
                { name: "Overhead Press", sets: [{ reps: 8, weight: 65 }, { reps: 8, weight: 70 }, { reps: 6, weight: 75 }] },
                { name: "Leg Press", sets: [{ reps: 12, weight: 180 }, { reps: 10, weight: 200 }, { reps: 10, weight: 220 }] },
                { name: "Lat Pulldown", sets: [{ reps: 12, weight: 90 }, { reps: 10, weight: 100 }, { reps: 8, weight: 110 }] },
                { name: "Dumbbell Lunges", sets: [{ reps: 10, weight: 30 }, { reps: 10, weight: 35 }, { reps: 8, weight: 40 }] },
              ],
              Cardio: [
                { name: "Treadmill Run", duration: 25, distance: 2.5, avgHR: 145, calories: 280 },
                { name: "Cycling", duration: 30, distance: 8.2, avgHR: 138, calories: 320 },
                { name: "Rowing Machine", duration: 20, distance: 4.0, avgHR: 152, calories: 240 },
                { name: "Stair Climber", duration: 15, distance: null, avgHR: 158, calories: 180 },
                { name: "Elliptical", duration: 25, distance: null, avgHR: 135, calories: 250 },
              ],
              HIIT: [
                { name: "Burpees", sets: [{ reps: 15, rest: 30 }, { reps: 12, rest: 30 }, { reps: 10, rest: 30 }] },
                { name: "Box Jumps", sets: [{ reps: 12, rest: 30 }, { reps: 12, rest: 30 }, { reps: 10, rest: 30 }] },
                { name: "Battle Ropes", sets: [{ duration: 30, rest: 20 }, { duration: 30, rest: 20 }, { duration: 25, rest: 20 }] },
                { name: "Kettlebell Swings", sets: [{ reps: 20, weight: 35, rest: 30 }, { reps: 18, weight: 35, rest: 30 }] },
                { name: "Mountain Climbers", sets: [{ reps: 30, rest: 20 }, { reps: 30, rest: 20 }, { reps: 25, rest: 20 }] },
                { name: "Jump Squats", sets: [{ reps: 15, rest: 30 }, { reps: 15, rest: 30 }, { reps: 12, rest: 30 }] },
              ],
              Mobility: [
                { name: "Hip Flexor Stretch", duration: 60, notes: "Each side" },
                { name: "Cat-Cow Stretch", duration: 90, reps: 15 },
                { name: "Foam Roll - IT Band", duration: 120, notes: "Each leg" },
                { name: "World's Greatest Stretch", duration: 90, reps: 8 },
                { name: "Pigeon Pose", duration: 60, notes: "Each side" },
                { name: "Thoracic Spine Rotation", duration: 60, reps: 10 },
                { name: "Ankle Mobility Drill", duration: 90, notes: "Each ankle" },
              ],
            };
            
            const availableExercises = exercisesByType[workoutType];
            const numExercises = 3 + (seed % 4); // 3-6 exercises
            const exercises = [];
            
            for (let j = 0; j < numExercises && j < availableExercises.length; j++) {
              const exIndex = (seed + j * 11) % availableExercises.length;
              exercises.push(availableExercises[exIndex]);
            }
            
            const totalDuration = 30 + (seed % 45);
            const totalCalories = 200 + (seed % 300);
            
            return {
              type: workoutType,
              duration: totalDuration,
              calories: totalCalories,
              exercises
            };
          };
          
          const workoutData = hasWorkout ? generateWorkout() : null;
          
          return {
            date,
            dayNum: date.getDate(),
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            workout: workoutData,
            nutrition: nutritionData,
            sleep: hasSleep ? { hours: 5.5 + (seed % 35) / 10, quality: ["Poor", "Fair", "Good", "Great"][Math.floor(seed / 25)] } : null,
            steps: hasSteps ? { count: 4000 + (seed % 10000), activeMinutes: 20 + (seed % 50) } : null,
          };
        });

        const getIntensity = (day) => {
          let count = 0;
          if (day.workout) count++;
          if (day.nutrition) count++;
          if (day.sleep) count++;
          if (day.steps) count++;
          return count;
        };

        const intensityColors = { 0: "#f8f9f8", 1: `${TEAL}25`, 2: `${TEAL}45`, 3: `${TEAL}70`, 4: TEAL };
        const firstDate = calendarDays[0].date;
        const paddingDays = firstDate.getDay();

        return (
          <div style={{
            background: `linear-gradient(150deg, #f8f9f8, #f5f7f6, #fafbfa)`,
            borderRadius: 20, border: `1px solid ${BORDER}`,
            padding: isMobile ? "20px" : "28px 32px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: TEXT }}>30 Day Activity</div>
                <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 2 }}>Tap any day to see details</div>
              </div>
              {!isMobile && (
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { label: "Workout", color: TEAL },
                    { label: "Nutrition", color: "#ef6c3e" },
                    { label: "Sleep", color: "#8e7cc3" },
                    { label: "Steps", color: "#3aafa9" },
                  ].map((l, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                      <span style={{ fontSize: 11, color: TEXT_SEC, fontWeight: 500 }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

{/* Desktop: side-by-side layout, Mobile: stacked */}
  <div style={{ display: isMobile ? "block" : "flex", gap: 20, alignItems: "flex-start" }}>
  {/* Calendar section */}
  <div style={{ 
    width: isMobile ? "100%" : (selectedCalDay !== null ? "55%" : "100%"),
    minWidth: 0,
    transition: "width 0.25s ease"
  }}>
                {/* Day headers */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: isMobile ? 4 : 6, marginBottom: 6, minWidth: 0 }}>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                    <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: TEXT_SEC, minWidth: 0 }}>{isMobile ? d.charAt(0) : d}</div>
                  ))}
                </div>

{/* Calendar grid */}
  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: isMobile ? 4 : 6, marginBottom: isMobile ? 16 : 0, minWidth: 0 }}>
                  {Array.from({ length: paddingDays }).map((_, i) => (
                    <div key={`pad-${i}`} style={{ aspectRatio: "1", minWidth: 0 }} />
                  ))}
                  {calendarDays.map((day, i) => {
                    const intensity = getIntensity(day);
                    const isSelected = selectedCalDay === i;
                    const isToday = day.date.toDateString() === today.toDateString();
                    
                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedCalDay(isSelected ? null : i)}
                        style={{
                          aspectRatio: "1", borderRadius: isMobile ? 6 : 10,
                          background: intensityColors[intensity],
                          border: isSelected ? `2px solid ${TEAL}` : isToday ? `2px solid ${MINT}` : `1px solid ${intensity > 0 ? "transparent" : BORDER}`,
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", transition: "all 0.15s ease", position: "relative",
                          transform: isSelected ? "scale(1.05)" : "scale(1)",
                          boxShadow: isSelected ? `0 4px 12px ${TEAL}30` : "none",
                          minWidth: 0
                        }}
                      >
                        <div style={{ fontSize: isMobile ? 11 : 14, fontWeight: isToday ? 800 : 600, color: intensity >= 3 ? WHITE : TEXT }}>
                          {day.dayNum}
                        </div>
                        {!isMobile && (
                          <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                            {day.workout && <div style={{ width: 4, height: 4, borderRadius: "50%", background: intensity >= 3 ? WHITE : TEAL }} />}
                            {day.nutrition && <div style={{ width: 4, height: 4, borderRadius: "50%", background: intensity >= 3 ? WHITE : "#ef6c3e" }} />}
                            {day.sleep && <div style={{ width: 4, height: 4, borderRadius: "50%", background: intensity >= 3 ? WHITE : "#8e7cc3" }} />}
                            {day.steps && <div style={{ width: 4, height: 4, borderRadius: "50%", background: intensity >= 3 ? WHITE : "#3aafa9" }} />}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected day details */}
              {selectedCalDay !== null && (() => {
                const day = calendarDays[selectedCalDay];
                const hasAny = day.workout || day.nutrition || day.sleep || day.steps;
                
return (
  <div style={{
  flex: isMobile ? "none" : "1",
  minWidth: 0,
  background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`,
  padding: isMobile ? "16px" : "18px", marginTop: isMobile ? 8 : 0,
  maxHeight: isMobile ? "none" : "480px", overflowY: isMobile ? "visible" : "auto"
  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{day.dayName}, {day.month} {day.dayNum}</div>
                      <div style={{ fontSize: 12, color: TEXT_SEC }}>{hasAny ? `${getIntensity(day)} categories logged` : "No activity logged"}</div>
                    </div>
                    <div onClick={() => setSelectedCalDay(null)} style={{
                      width: 28, height: 28, borderRadius: 8, background: "#f0f2f1",
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEXT_SEC} strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </div>
                  </div>

                  {!hasAny ? (
                    <div style={{ textAlign: "center", padding: "20px 0", color: TEXT_SEC }}>No data recorded for this day</div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 12 }}>
{day.workout && (
  <div style={{ padding: "14px 16px", borderRadius: 12, background: `${TEAL}08`, border: `1px solid ${TEAL}15`, gridColumn: isMobile ? "1" : "1 / -1" }}>
    <div 
      onClick={() => setWorkoutExpanded(!workoutExpanded)}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${TEAL}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.2"><rect x="1" y="10" width="4" height="4" rx="1"/><rect x="19" y="10" width="4" height="4" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </div>
        <div>
          <span style={{ fontSize: 14, fontWeight: 700, color: TEAL }}>{day.workout.type} Workout</span>
        </div>
      </div>
      {/* Workout summary */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{day.workout.duration}</div>
            <div style={{ fontSize: 10, color: TEXT_SEC, textTransform: "uppercase" }}>Min</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#ef6c3e" }}>{day.workout.calories}</div>
            <div style={{ fontSize: 10, color: TEXT_SEC, textTransform: "uppercase" }}>Cal</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEAL }}>{day.workout.exercises.length}</div>
            <div style={{ fontSize: 10, color: TEXT_SEC, textTransform: "uppercase" }}>Exercises</div>
          </div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEXT_SEC} strokeWidth="2" strokeLinecap="round" style={{ transform: workoutExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </div>
    </div>
    
    {/* Individual exercises - collapsible */}
    {workoutExpanded && (
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
        {day.workout.exercises.map((exercise, idx) => (
          <div key={idx} style={{
            display: "flex", flexDirection: "column", gap: 8, padding: "12px 14px",
            background: WHITE, borderRadius: 10, border: `1px solid ${BORDER}`
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{exercise.name}</div>
              {exercise.duration && !exercise.sets && (
                <div style={{ fontSize: 12, color: TEXT_SEC }}>{exercise.duration}s {exercise.notes || ""}</div>
              )}
            </div>
            
            {/* Strength exercises with sets */}
            {exercise.sets && exercise.sets[0]?.weight !== undefined && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {exercise.sets.map((set, sIdx) => (
                  <div key={sIdx} style={{
                    padding: "6px 10px", borderRadius: 6, background: "#f7faf9", border: `1px solid ${BORDER}`,
                    display: "flex", alignItems: "center", gap: 6
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: TEAL }}>Set {sIdx + 1}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{set.weight} lbs</span>
                    <span style={{ fontSize: 11, color: TEXT_SEC }}>x {set.reps}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* HIIT exercises with sets */}
            {exercise.sets && exercise.sets[0]?.rest !== undefined && exercise.sets[0]?.weight === undefined && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {exercise.sets.map((set, sIdx) => (
                  <div key={sIdx} style={{
                    padding: "6px 10px", borderRadius: 6, background: "#fef3c7", border: `1px solid #fcd34d`,
                    display: "flex", alignItems: "center", gap: 6
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#d97706" }}>Set {sIdx + 1}</span>
                    {set.reps && <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{set.reps} reps</span>}
                    {set.duration && <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{set.duration}s</span>}
                    {set.weight && <span style={{ fontSize: 11, color: TEXT_SEC }}>@ {set.weight} lbs</span>}
                    <span style={{ fontSize: 10, color: TEXT_SEC }}>({set.rest}s rest)</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Cardio exercises */}
            {exercise.avgHR !== undefined && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <div style={{ padding: "4px 10px", borderRadius: 6, background: "#dbeafe" }}>
                  <span style={{ fontSize: 11, color: "#3b82f6", fontWeight: 600 }}>{exercise.duration} min</span>
                </div>
                {exercise.distance && (
                  <div style={{ padding: "4px 10px", borderRadius: 6, background: "#dcfce7" }}>
                    <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>{exercise.distance} mi</span>
                  </div>
                )}
                <div style={{ padding: "4px 10px", borderRadius: 6, background: "#fee2e2" }}>
                  <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 600 }}>{exercise.avgHR} bpm avg</span>
                </div>
                <div style={{ padding: "4px 10px", borderRadius: 6, background: "#fef3c7" }}>
                  <span style={{ fontSize: 11, color: "#d97706", fontWeight: 600 }}>{exercise.calories} cal</span>
                </div>
              </div>
            )}
            
            {/* Mobility exercises */}
            {exercise.duration && !exercise.sets && !exercise.avgHR && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <div style={{ padding: "4px 10px", borderRadius: 6, background: "#f3e8ff" }}>
                  <span style={{ fontSize: 11, color: "#8b5cf6", fontWeight: 600 }}>{exercise.duration}s hold</span>
                </div>
                {exercise.reps && (
                  <div style={{ padding: "4px 10px", borderRadius: 6, background: "#e0e7ff" }}>
                    <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 600 }}>{exercise.reps} reps</span>
                  </div>
                )}
                {exercise.notes && (
                  <div style={{ padding: "4px 10px", borderRadius: 6, background: "#f3f4f6" }}>
                    <span style={{ fontSize: 11, color: TEXT_SEC }}>{exercise.notes}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
  )}
                      {day.nutrition && (
                        <div style={{ padding: "14px 16px", borderRadius: 12, background: `#ef6c3e08`, border: `1px solid #ef6c3e15`, gridColumn: isMobile ? "1" : "1 / -1" }}>
                          <div 
                            onClick={() => setNutritionExpanded(!nutritionExpanded)}
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 8, background: `#ef6c3e15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef6c3e" strokeWidth="2"><path d="M12 3Q13 2 14.5 3 Q13 4 12 5.5"/><path d="M12 5.5 Q7 5 5 9 Q3 13 5 17 Q7 21 12 21 Q17 21 19 17 Q21 13 19 9 Q17 5 12 5.5Z"/></svg>
                              </div>
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#ef6c3e" }}>Nutrition</span>
                              <span style={{ fontSize: 12, color: TEXT_SEC }}>({day.nutrition.meals.length} meals)</span>
                            </div>
                            {/* Daily totals */}
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                <div style={{ textAlign: "center" }}>
                                  <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{day.nutrition.totals.calories}</div>
                                  <div style={{ fontSize: 10, color: TEXT_SEC, textTransform: "uppercase" }}>Cal</div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                  <div style={{ fontSize: 15, fontWeight: 700, color: "#3b82f6" }}>{day.nutrition.totals.protein}g</div>
                                  <div style={{ fontSize: 10, color: TEXT_SEC, textTransform: "uppercase" }}>Protein</div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                  <div style={{ fontSize: 15, fontWeight: 700, color: "#f59e0b" }}>{day.nutrition.totals.carbs}g</div>
                                  <div style={{ fontSize: 10, color: TEXT_SEC, textTransform: "uppercase" }}>Carbs</div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                  <div style={{ fontSize: 15, fontWeight: 700, color: "#8b5cf6" }}>{day.nutrition.totals.fat}g</div>
                                  <div style={{ fontSize: 10, color: TEXT_SEC, textTransform: "uppercase" }}>Fat</div>
                                </div>
                              </div>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEXT_SEC} strokeWidth="2" strokeLinecap="round" style={{ transform: nutritionExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
                                <polyline points="6,9 12,15 18,9"/>
                              </svg>
                            </div>
                          </div>
                          
                          {/* Individual meals - collapsible */}
                          {nutritionExpanded && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
                              {day.nutrition.meals.map((meal, idx) => (
                                <div key={idx} style={{
                                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                                  background: WHITE, borderRadius: 10, border: `1px solid ${BORDER}`
                                }}>
                                  <div style={{
                                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                                    background: meal.type === "Breakfast" ? "#fef3c7" : meal.type === "Lunch" ? "#dcfce7" : meal.type === "Dinner" ? "#fce7f3" : "#e0e7ff",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                  }}>
                                    {meal.type === "Breakfast" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>}
                                    {meal.type === "Lunch" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M12 12m-9 0a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0"/><path d="M12 7v5l3 3"/></svg>}
                                    {meal.type === "Dinner" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>}
                                    {meal.type === "Snacks" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M12 3Q13 2 14.5 3 Q13 4 12 5.5"/><path d="M12 5.5 Q7 5 5 9 Q3 13 5 17 Q7 21 12 21 Q17 21 19 17 Q21 13 19 9 Q17 5 12 5.5Z"/></svg>}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                                      <span style={{ fontSize: 11, fontWeight: 600, color: TEXT_SEC, textTransform: "uppercase" }}>{meal.type}</span>
                                      <span style={{ fontSize: 11, color: TEXT_SEC }}>{meal.time}</span>
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meal.name}</div>
                                  </div>
                                  <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                                    <div style={{ padding: "4px 8px", borderRadius: 6, background: "#f3f4f6", textAlign: "center", minWidth: 48 }}>
                                      <div style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{meal.calories}</div>
                                      <div style={{ fontSize: 9, color: TEXT_SEC }}>cal</div>
                                    </div>
                                    <div style={{ padding: "4px 8px", borderRadius: 6, background: "#dbeafe", textAlign: "center", minWidth: 40 }}>
                                      <div style={{ fontSize: 12, fontWeight: 700, color: "#3b82f6" }}>{meal.protein}g</div>
                                      <div style={{ fontSize: 9, color: "#3b82f6" }}>P</div>
                                    </div>
                                    <div style={{ padding: "4px 8px", borderRadius: 6, background: "#fef3c7", textAlign: "center", minWidth: 40 }}>
                                      <div style={{ fontSize: 12, fontWeight: 700, color: "#d97706" }}>{meal.carbs}g</div>
                                      <div style={{ fontSize: 9, color: "#d97706" }}>C</div>
                                    </div>
                                    <div style={{ padding: "4px 8px", borderRadius: 6, background: "#f3e8ff", textAlign: "center", minWidth: 40 }}>
                                      <div style={{ fontSize: 12, fontWeight: 700, color: "#8b5cf6" }}>{meal.fat}g</div>
                                      <div style={{ fontSize: 9, color: "#8b5cf6" }}>F</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {day.nutrition.meals.length === 0 && (
                                <div style={{ textAlign: "center", padding: "16px", color: TEXT_SEC, fontSize: 13 }}>No meals logged</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {day.sleep && (
                        <div style={{ padding: "14px 16px", borderRadius: 12, background: `#8e7cc308`, border: `1px solid #8e7cc315` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: `#8e7cc315`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e7cc3" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#8e7cc3" }}>Sleep</span>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <div><span style={{ fontSize: 11, color: TEXT_SEC }}>Duration:</span> <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{day.sleep.hours.toFixed(1)} hrs</span></div>
                            <div><span style={{ fontSize: 11, color: TEXT_SEC }}>Quality:</span> <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{day.sleep.quality}</span></div>
                          </div>
                        </div>
                      )}
                      {day.steps && (
                        <div style={{ padding: "14px 16px", borderRadius: 12, background: `#3aafa908`, border: `1px solid #3aafa915` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: `#3aafa915`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3aafa9" strokeWidth="2"><circle cx="12" cy="5" r="2"/><path d="M10 22V18L7 13l3-4.5h4l3 4.5-3 5v4"/></svg>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#3aafa9" }}>Steps</span>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <div><span style={{ fontSize: 11, color: TEXT_SEC }}>Steps:</span> <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{day.steps.count.toLocaleString()}</span></div>
                            <div><span style={{ fontSize: 11, color: TEXT_SEC }}>Active:</span> <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{day.steps.activeMinutes} min</span></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
            </div>
          </div>
        );
      })()}

      {/* ─── DAILY BREAKDOWN CARDS ─── */}
      {(() => {
        const cards = [
          {
            title: "Nutrition", color: "#ef6c3e",
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3Q13 2 14.5 3 Q13 4 12 5.5"/><path d="M12 5.5 Q7 5 5 9 Q3 13 5 17 Q7 21 11.5 21 Q12 20 12.5 21 Q17 21 19 17 Q21 13 19 9 Q17 5 12 5.5Z"/></svg>,
            periods: [
              { label: "Today", rows: [
                { l: "Calories", v: "1,620", g: "1,800" }, { l: "Protein", v: `${client.proteinAvg + 2}g`, g: `${client.proteinTarget}g` },
                { l: "Carbs", v: `${Math.round(client.proteinAvg * 1.9)}g`, g: `${Math.round(client.proteinTarget * 2)}g` }, { l: "Fats", v: `${Math.round(client.proteinAvg * 0.58)}g`, g: `${Math.round(client.proteinTarget * 0.6)}g` },
                { l: "Fiber", v: "24g", g: "30g" }, { l: "Water", v: "72 oz", g: "80 oz" },
              ]},
              { label: "Last 7 Days", rows: [
                { l: "Calories", v: "1,580", g: "1,800" }, { l: "Protein", v: `${client.proteinAvg}g`, g: `${client.proteinTarget}g` },
                { l: "Carbs", v: `${Math.round(client.proteinAvg * 1.8)}g`, g: `${Math.round(client.proteinTarget * 2)}g` }, { l: "Fats", v: `${Math.round(client.proteinAvg * 0.55)}g`, g: `${Math.round(client.proteinTarget * 0.6)}g` },
                { l: "Fiber", v: "22g", g: "30g" }, { l: "Water", v: "64 oz", g: "80 oz" },
              ]},
              { label: "Last 30 Days", rows: [
                { l: "Calories", v: "1,540", g: "1,800" }, { l: "Protein", v: `${client.proteinAvg - 6}g`, g: `${client.proteinTarget}g` },
                { l: "Carbs", v: `${Math.round(client.proteinAvg * 1.7)}g`, g: `${Math.round(client.proteinTarget * 2)}g` }, { l: "Fats", v: `${Math.round(client.proteinAvg * 0.52)}g`, g: `${Math.round(client.proteinTarget * 0.6)}g` },
                { l: "Fiber", v: "20g", g: "30g" }, { l: "Water", v: "58 oz", g: "80 oz" },
              ]},
            ],
          },
          {
            title: "Activity", color: TEAL,
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="1" y="10" width="4" height="4" rx="1"/><rect x="19" y="10" width="4" height="4" rx="1"/><rect x="5" y="7" width="3" height="10" rx="1"/><rect x="16" y="7" width="3" height="10" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
            periods: [
              { label: "Today", rows: [
                { l: "Steps", v: client.steps?.toLocaleString(), g: "10,000" }, { l: "Workouts", v: "1", g: "1" },
                { l: "Active Min", v: "48 min", g: "45 min" }, { l: "Distance", v: "4.1 mi", g: "4.5 mi" },
                { l: "Cal Burned", v: "420", g: "500" }, { l: "Floors", v: "10", g: "10" },
              ]},
              { label: "Last 7 Days", rows: [
                { l: "Steps Avg", v: client.steps?.toLocaleString(), g: "10,000" }, { l: "Workouts", v: `${client.workoutDays}`, g: "5" },
                { l: "Active Min", v: "42 min", g: "45 min" }, { l: "Distance", v: "3.8 mi", g: "4.5 mi" },
                { l: "Cal Burned", v: "385", g: "500" }, { l: "Floors", v: "8", g: "10" },
              ]},
              { label: "Last 30 Days", rows: [
                { l: "Steps Avg", v: `${(client.steps - 400).toLocaleString()}`, g: "10,000" }, { l: "Workouts", v: `${client.workoutDays * 4}`, g: "20" },
                { l: "Active Min", v: "38 min", g: "45 min" }, { l: "Distance", v: "3.4 mi", g: "4.5 mi" },
                { l: "Cal Burned", v: "350", g: "500" }, { l: "Floors", v: "7", g: "10" },
              ]},
            ],
          },
          {
            title: "Sleep", color: "#8e7cc3",
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
            periods: [
              { label: "Today", rows: [
                { l: "Duration", v: "7.2 hrs", g: "8 hrs" }, { l: "Bedtime", v: "10:45 PM", g: "10:30 PM" },
                { l: "Wake Time", v: "5:57 AM" }, { l: "Quality", v: "Good" },
                { l: "Deep Sleep", v: "1.8 hrs", g: "2 hrs" }, { l: "REM", v: "2.1 hrs", g: "2 hrs" },
              ]},
              { label: "Last 7 Days", rows: [
                { l: "Duration", v: "6.8 hrs", g: "8 hrs" }, { l: "Bedtime", v: "11:15 PM", g: "10:30 PM" },
                { l: "Wake Time", v: "6:05 AM" }, { l: "Quality", v: "Good" },
                { l: "Deep Sleep", v: "1.5 hrs", g: "2 hrs" }, { l: "REM", v: "1.9 hrs", g: "2 hrs" },
              ]},
              { label: "Last 30 Days", rows: [
                { l: "Duration", v: "6.5 hrs", g: "8 hrs" }, { l: "Bedtime", v: "11:30 PM", g: "10:30 PM" },
                { l: "Wake Time", v: "6:10 AM" }, { l: "Quality", v: "Fair" },
                { l: "Deep Sleep", v: "1.3 hrs", g: "2 hrs" }, { l: "REM", v: "1.7 hrs", g: "2 hrs" },
              ]},
            ],
          },
        ];

        return (
          <div style={{
            background: WHITE, borderRadius: 20, border: `1px solid ${BORDER}`,
            padding: isMobile ? "18px" : "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}>
            <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, color: TEXT, marginBottom: 14 }}>Daily Breakdown</div>
            <div style={{
              display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory",
              paddingBottom: 8, WebkitOverflowScrolling: "touch",
              msOverflowStyle: "none", scrollbarWidth: "none"
            }}>
              {cards.map((card, ci) => (
                <div key={ci} style={{
                  flex: "none", width: isMobile ? "85vw" : 300,
                  scrollSnapAlign: "start",
                  background: "#fafcfb", borderRadius: 16, border: `1px solid ${BORDER}`,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.03)", overflow: "hidden"
                }}>
                  {/* Card header */}
                  <div style={{
                    padding: "14px 16px 10px", display: "flex", alignItems: "center", gap: 8,
                    borderBottom: `1px solid ${BORDER}`,
                    background: `linear-gradient(135deg, ${card.color}08, ${card.color}04)`
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: `${card.color}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: card.color
                    }}>{card.icon}</div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{card.title}</span>
                  </div>

                  {/* Period tabs + data */}
                  <DataCardPeriods periods={card.periods} color={card.color} isMobile={isMobile} />
                </div>
              ))}
            </div>
            {/* Scroll hint */}
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
              {cards.map((_, i) => (
                <div key={i} style={{ width: i === 0 ? 16 : 6, height: 6, borderRadius: 3, background: i === 0 ? TEAL : "#d4ddd9", transition: "all 0.3s ease" }} />
              ))}
            </div>
          </div>
        );
      })()}

      {/* ─── PROFILE & BASELINES (COLLAPSIBLE) ─── */}
      {(() => {
        const current = client.current || {};
        const goals = client.goals || {};
        const profile = client.profile || {};
        const assessment = client.assessment || {};
        const strengthBaselines = assessment.strengthBaselines || {};
        
        const summaryText = `${current.bodyweight || 153} lbs · ${current.bodyFat || 25.2}% BF · ${profile.trainingStyle || "Barbell-focused"}`;
        
        return (
          <div style={{
            background: WHITE, borderRadius: 20, border: `1px solid ${BORDER}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden"
          }}>
            {/* Collapsible header */}
            <div
              onClick={() => setProfileExpanded(!profileExpanded)}
              style={{
                padding: isMobile ? "16px 18px" : "18px 28px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", background: profileExpanded ? "#f7faf9" : "transparent",
                transition: "background 0.2s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${TEAL}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Profile & Baselines</div>
                  {!profileExpanded && <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2 }}>{summaryText}</div>}
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEXT_SEC} strokeWidth="2" strokeLinecap="round" style={{ transform: profileExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </div>

            {/* Expanded content */}
            {profileExpanded && (
              <div style={{ padding: isMobile ? "0 18px 18px" : "0 28px 24px" }}>
                {/* Two-column grid */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 18 }}>
                  {/* Body composition */}
                  <div style={{ padding: "16px", borderRadius: 14, background: "#f7faf9", border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Body Composition</div>
                    {[
                      ["Weight", `${current.bodyweight || 153} lbs`],
                      ["Goal Weight", `${goals.targetWeight || 138} lbs`],
                      ["Body Fat", `${current.bodyFat || 25.2}%`],
                      ["Lean Mass", `${current.leanMass || 114} lbs`],
                      ["Height", profile.height || `5'6"`],
                    ].map(([l, v], i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 4 ? `1px solid ${BORDER}` : "none" }}>
                        <span style={{ fontSize: 13, color: TEXT_SEC }}>{l}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Training details */}
                  <div style={{ padding: "16px", borderRadius: 14, background: "#f7faf9", border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: MINT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Training Details</div>
                    {[
                      ["Style", profile.trainingStyle || "Barbell-focused"],
                      ["Experience", profile.experience || "Intermediate"],
                      ["Sessions/Week", `${client.sessionsPerWeek || 3} days`],
                      ["Preferred Time", profile.preferredTime || "Morning"],
                      ["Communication", profile.communication || "Text"],
                    ].map(([l, v], i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 4 ? `1px solid ${BORDER}` : "none" }}>
                        <span style={{ fontSize: 13, color: TEXT_SEC }}>{l}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strength baselines */}
                {Object.keys(strengthBaselines).length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Strength Baselines</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {Object.entries(strengthBaselines).map(([key, val], i) => {
                        const names = { squat: "Back Squat", deadlift: "Deadlift", benchPress: "Bench Press", overheadPress: "OHP" };
                        const currentVal = { squat: "120x6", deadlift: "155x5", benchPress: "85x8", overheadPress: "55x6" };
                        return (
                          <div key={i} style={{ padding: "8px 14px", borderRadius: 10, background: `${TEAL}08`, border: `1px solid ${TEAL}15` }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{names[key] || key}</span>
                            <span style={{ fontSize: 12, color: TEXT_SEC, marginLeft: 6 }}>{val.weight}x{val.reps}</span>
                            <span style={{ fontSize: 12, color: TEAL, marginLeft: 4 }}>→ {currentVal[key] || `${val.weight + 20}x${val.reps}`}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Coach notes */}
                <div style={{ padding: "14px 16px", borderRadius: 12, background: "#fafbfa", borderLeft: `3px solid ${TEAL}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Coach Notes</div>
                  <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.6 }}>
                    {client.coachNotes || `${client.name.split(" ")[0]} responds well to detailed form cues and progressive overload programming. Focus on hip mobility before squat sessions.`}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

/* ═════════════════════════════════�����═══════════
   SEND REPORT MODAL
   ═════════════════════════════════════════════ */

function CalendarCanvas({ data, type, selectedDay, onSelectDay, onClose }) {
  if (!data) return null;
  
  // Generate 31 days for the month view
  const today = new Date();
  const currentMonth = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Map data days to calendar - spread across month
  const getDayData = (dayNum) => {
    if (!data.days) return null;
    const dayIndex = (dayNum - 1) % data.days.length;
    return data.days[dayIndex];
  };
  
  const getDayLabel = (dayNum) => {
    const dayData = getDayData(dayNum);
    if (!dayData) return null;
    if (type === "mealPlan") {
      const totalCals = dayData.meals?.reduce((sum, m) => sum + (m.calories || 0), 0) || 0;
      return `${totalCals} cal`;
    }
    if (type === "workout") {
      return dayData.focus || "Rest";
    }
    return null;
  };
  
  const getDayColor = (dayNum) => {
    const dayData = getDayData(dayNum);
    if (!dayData) return null;
    if (type === "workout" && dayData.focus === "Rest Day") return "#f3f4f6";
    if (type === "workout" && dayData.exercises?.length > 0) return TEAL_LIGHT;
    if (type === "mealPlan") return TEAL_LIGHT;
    return null;
  };

  // Detail view when a day is selected
  if (selectedDay !== null) {
    const dayData = getDayData(selectedDay);
    const dayOfWeek = dayNames[new Date(today.getFullYear(), today.getMonth(), selectedDay).getDay()];
    
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative", background: "#fafcfb" }}>
        {/* Subtle close button - returns to calendar view */}
        <div 
          onClick={() => onSelectDay(null)}
          style={{ 
            position: "absolute", top: 16, right: 16, zIndex: 10,
            width: 32, height: 32, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: TEXT_SEC, opacity: 0.4,
            background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)",
            border: `1px solid ${BORDER}`,
            transition: "all 0.2s ease"
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = WHITE; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = 0.4; e.currentTarget.style.background = "rgba(255,255,255,0.8)"; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        
        {/* Day header with animation */}
        <div style={{ 
          padding: "24px 28px 20px",
          background: `linear-gradient(135deg, ${WHITE} 0%, #f7fafa 100%)`,
          borderBottom: `1px solid ${BORDER}`,
          animation: "fadeUp 0.4s ease-out forwards"
        }}>
          <div style={{ 
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "4px 12px 4px 8px", borderRadius: 20,
            background: TEAL_LIGHT, marginBottom: 12,
            fontSize: 11, fontWeight: 600, color: TEAL,
            textTransform: "uppercase", letterSpacing: "0.05em"
          }}>
            <div style={{ 
              width: 6, height: 6, borderRadius: "50%", background: TEAL,
              animation: "pulseGlow 2s ease-in-out infinite"
            }} />
            {type === "mealPlan" ? "Daily Nutrition" : "Daily Training"}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>
            {dayOfWeek}, {currentMonth.split(' ')[0]} {selectedDay}
          </div>
          <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 4 }}>
            {type === "mealPlan" ? "Tap any meal to edit via chat" : "Tap any exercise to modify"}
          </div>
        </div>
        
        {/* Day detail content with staggered animations */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {type === "mealPlan" && dayData?.meals && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {dayData.meals.map((meal, idx) => (
                <div key={idx} style={{
                  background: WHITE, borderRadius: 16, padding: 18,
                  border: `1px solid ${BORDER}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  opacity: 0, transform: "translateY(12px)",
                  animation: `fadeUp 0.4s ease-out ${0.15 + idx * 0.08}s forwards`,
                  cursor: "pointer", transition: "all 0.2s ease"
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, color: TEAL, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                    {meal.type}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 10 }}>{meal.name}</div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: TEXT_SEC }}>
                    <span style={{ fontWeight: 600, color: TEXT }}>{meal.calories} cal</span>
                    <span>{meal.protein}g protein</span>
                    <span>{meal.carbs}g carbs</span>
                    <span>{meal.fat}g fat</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {type === "workout" && dayData && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ 
                padding: "14px 18px", background: `linear-gradient(135deg, ${TEAL_LIGHT} 0%, #e8f5f4 100%)`,
                borderRadius: 14, fontSize: 15, fontWeight: 600, color: TEXT,
                opacity: 0, animation: "fadeUp 0.4s ease-out 0.1s forwards",
                display: "flex", alignItems: "center", gap: 10
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: TEAL }} />
                {dayData.focus}
              </div>
              {dayData.exercises?.map((ex, idx) => (
                <div key={idx} style={{
                  background: WHITE, borderRadius: 16, padding: 18,
                  border: `1px solid ${BORDER}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  opacity: 0, transform: "translateY(12px)",
                  animation: `fadeUp 0.4s ease-out ${0.2 + idx * 0.08}s forwards`,
                  cursor: "pointer", transition: "all 0.2s ease"
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>{ex.name}</div>
                    <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 6 }}>
                      {ex.sets} sets × {ex.reps} @ {ex.weight}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: TEXT_SEC, background: "#f5f7f6", padding: "6px 12px", borderRadius: 8, fontWeight: 500 }}>
                    {ex.rest}
                  </div>
                </div>
              ))}
              {(!dayData.exercises || dayData.exercises.length === 0) && (
                <div style={{ 
                  padding: 40, textAlign: "center", color: TEXT_SEC, fontSize: 14,
                  background: WHITE, borderRadius: 16, border: `1px dashed ${BORDER}`,
                  opacity: 0, animation: "fadeUp 0.4s ease-out 0.2s forwards"
                }}>
                  Rest day - recovery is part of the process
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Hint bar with AI indicator */}
        <div style={{
          padding: "14px 20px", borderTop: `1px solid ${BORDER}`,
          background: WHITE, fontSize: 13, color: TEXT_SEC,
          display: "flex", alignItems: "center", gap: 10,
          animation: "fadeUp 0.5s ease-out 0.6s both"
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: 8, background: TEAL_LIGHT,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span>Ask Milton to customize: "Swap lunch for grilled salmon"</span>
        </div>
      </div>
    );
  }
  
  // Calendar grid view
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative", background: "#fafcfb" }}>
      {/* Subtle close button */}
      <div 
        onClick={onClose}
        style={{ 
          position: "absolute", top: 16, right: 16, zIndex: 10,
          width: 32, height: 32, borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: TEXT_SEC, opacity: 0.4,
          background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)",
          border: `1px solid ${BORDER}`,
          transition: "all 0.2s ease"
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = WHITE; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = 0.4; e.currentTarget.style.background = "rgba(255,255,255,0.8)"; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </div>
      
      {/* AI-style header with shimmer accent */}
      <div style={{ 
        padding: "24px 28px 20px", 
        background: `linear-gradient(135deg, ${WHITE} 0%, #f7fafa 100%)`,
        borderBottom: `1px solid ${BORDER}`,
        animation: "fadeUp 0.5s ease-out forwards"
      }}>
        <div style={{ 
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "4px 12px 4px 8px", borderRadius: 20,
          background: TEAL_LIGHT, marginBottom: 12,
          fontSize: 11, fontWeight: 600, color: TEAL,
          textTransform: "uppercase", letterSpacing: "0.05em"
        }}>
          <div style={{ 
            width: 6, height: 6, borderRadius: "50%", background: TEAL,
            animation: "pulseGlow 2s ease-in-out infinite"
          }} />
          {type === "mealPlan" ? "Nutrition Plan" : "Training Program"}
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>
          {currentMonth}
        </div>
        <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 4 }}>
          {type === "mealPlan" ? `Personalized meal plan for ${data.client}` : `${data.programName} for ${data.client}`}
        </div>
      </div>
      
      {/* Day name headers */}
      <div style={{ 
        display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4,
        padding: "12px 20px", background: WHITE,
        animation: "fadeUp 0.5s ease-out 0.1s both"
      }}>
        {dayNames.map((d, i) => (
          <div key={d} style={{ 
            textAlign: "center", fontSize: 11, fontWeight: 600, 
            color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.04em",
            padding: "6px 0",
            animation: `fadeUp 0.4s ease-out ${0.15 + i * 0.03}s both`
          }}>
            {d}
          </div>
        ))}
      </div>
      
      {/* Calendar grid with staggered animations */}
      <div style={{ 
        flex: 1, overflowY: "auto", padding: "8px 16px 16px",
        display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8,
        alignContent: "start"
      }}>
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
          <div key={`empty-${idx}`} style={{ aspectRatio: "1", borderRadius: 12 }} />
        ))}
        
        {/* Day cells with staggered reveal animation */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const isToday = dayNum === today.getDate();
          const dayColor = getDayColor(dayNum);
          const label = getDayLabel(dayNum);
          const animDelay = 0.2 + (Math.floor(idx / 7) * 0.08) + ((idx % 7) * 0.02);
          
          return (
            <div
              key={dayNum}
              onClick={() => onSelectDay(dayNum)}
              style={{
                aspectRatio: "1", borderRadius: 14,
                background: isToday ? `linear-gradient(135deg, ${TEAL} 0%, #1f8785 100%)` : dayColor || WHITE,
                border: isToday ? "none" : `1px solid ${BORDER}`,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                cursor: "pointer", 
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                padding: 6,
                boxShadow: isToday ? "0 4px 16px rgba(43,122,120,0.35)" : "0 1px 3px rgba(0,0,0,0.04)",
                opacity: 0,
                transform: "scale(0.85)",
                animation: `canvasCellReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${animDelay}s forwards`
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "scale(1.08)";
                e.currentTarget.style.boxShadow = isToday 
                  ? "0 8px 24px rgba(43,122,120,0.4)" 
                  : "0 8px 20px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = isToday 
                  ? "0 4px 16px rgba(43,122,120,0.35)" 
                  : "0 1px 3px rgba(0,0,0,0.04)";
              }}
            >
              <div style={{ 
                fontSize: 16, fontWeight: 700, 
                color: isToday ? WHITE : TEXT 
              }}>
                {dayNum}
              </div>
              {label && (
                <div style={{ 
                  fontSize: 9, fontWeight: 500, 
                  color: isToday ? "rgba(255,255,255,0.85)" : TEXT_SEC,
                  textAlign: "center", marginTop: 3,
                  lineHeight: 1.2, maxWidth: "100%",
                  overflow: "hidden", textOverflow: "ellipsis",
                  whiteSpace: "nowrap", padding: "0 2px"
                }}>
                  {label}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Hint bar with AI indicator */}
      <div style={{
        padding: "14px 20px", borderTop: `1px solid ${BORDER}`,
        background: WHITE, fontSize: 13, color: TEXT_SEC,
        display: "flex", alignItems: "center", gap: 10,
        animation: "fadeUp 0.5s ease-out 1s both"
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: 8, background: TEAL_LIGHT,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span>Click any day to view and edit with Milton</span>
      </div>
    </div>
  );
}

function InboxCanvas({ onClose, isMobile }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  
  const filters = [
    { id: "all", label: "All" },
    { id: "team", label: "Team", color: "#6366f1" },
    { id: "client", label: "Client", color: TEAL },
    { id: "announcement", label: "Announcements", color: "#f59e0b" }
  ];
  
  const conversations = [
    { 
      id: 1, name: "Sarah Chen", avatar: "SC", tag: "client",
      lastMessage: "Thanks for the updated meal plan!", time: "2m",
      unread: 2, online: true
    },
    { 
      id: 2, name: "Coaching Team", avatar: "CT", tag: "team", isGroup: true,
      lastMessage: "New protocol doc is ready for review", time: "15m",
      unread: 0, members: 5
    },
    { 
      id: 3, name: "Marcus Johnson", avatar: "MJ", tag: "client",
      lastMessage: "Can we move tomorrow's session?", time: "1h",
      unread: 1, online: false
    },
    { 
      id: 4, name: "Platform Updates", avatar: "M", tag: "announcement", isGroup: true,
      lastMessage: "New feature: Canvas templates are live!", time: "3h",
      unread: 0
    },
    { 
      id: 5, name: "Emily Rodriguez", avatar: "ER", tag: "client",
      lastMessage: "Just finished week 3 of the program!", time: "5h",
      unread: 0, online: true
    },
    { 
      id: 6, name: "Nutrition Team", avatar: "NT", tag: "team", isGroup: true,
      lastMessage: "Updated macro guidelines attached", time: "1d",
      unread: 0, members: 3
    }
  ];
  
  const filteredConvos = activeFilter === "all" 
    ? conversations 
    : conversations.filter(c => c.tag === activeFilter);
  
  const tagColors = { team: "#6366f1", client: TEAL, announcement: "#f59e0b" };
  
  return (
    <div style={{
      display: "flex", flexDirection: isMobile ? "column" : "row", height: "100%", background: WHITE
    }}>
      {/* Sidebar - Conversation List (show full on mobile if no conversation selected, or hide if conversation is selected) */}
      <div style={{
        width: isMobile ? "100%" : 300, 
        borderRight: isMobile ? "none" : `1px solid ${BORDER}`,
        display: isMobile && selectedConvo ? "none" : "flex", 
        flexDirection: "column", 
        background: "#fafcfb",
        flex: isMobile ? 1 : "none"
      }}>
        {/* Header */}
        <div style={{ padding: "16px 16px", borderBottom: `1px solid ${BORDER}` }}>
          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[
              { icon: "video", label: "Go Live", color: "#ef4444" },
              { icon: "user", label: "1-on-1" },
              { icon: "users", label: "Group" }
            ].map(btn => (
              <button
                key={btn.label}
                style={{
                  flex: 1, padding: "10px 8px", borderRadius: 10,
                  border: `1px solid ${BORDER}`, background: WHITE,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                  cursor: "pointer", fontSize: 11, fontWeight: 600, color: btn.color || TEXT,
                  transition: "all 0.15s ease", minWidth: 0, whiteSpace: "nowrap"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = btn.color || TEAL; e.currentTarget.style.background = btn.color ? `${btn.color}10` : TEAL_LIGHT; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = WHITE; }}
              >
                {btn.icon === "video" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>}
                {btn.icon === "user" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                {btn.icon === "users" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                {btn.label}
              </button>
            ))}
          </div>
          
          {/* Filter Tags */}
          <div style={{ display: "flex", gap: 6 }}>
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                style={{
                  padding: "6px 12px", borderRadius: 20,
                  border: activeFilter === f.id ? "none" : `1px solid ${BORDER}`,
                  background: activeFilter === f.id ? (f.color || TEXT) : "transparent",
                  color: activeFilter === f.id ? WHITE : TEXT_SEC,
                  fontSize: 12, fontWeight: 500, cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredConvos.map((convo, idx) => (
            <div
              key={convo.id}
              onClick={() => setSelectedConvo(convo)}
              style={{
                padding: "12px 16px", display: "flex", gap: 10, cursor: "pointer",
                background: selectedConvo?.id === convo.id ? TEAL_LIGHT : "transparent",
                borderBottom: `1px solid ${BORDER}`,
                animation: `fadeSlideIn 0.3s ease ${idx * 0.05}s both`
              }}
              onMouseEnter={e => { if (selectedConvo?.id !== convo.id) e.currentTarget.style.background = "#f5f7f6"; }}
              onMouseLeave={e => { if (selectedConvo?.id !== convo.id) e.currentTarget.style.background = "transparent"; }}
            >
              {/* Avatar */}
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: convo.isGroup ? "#f0f4f3" : `${tagColors[convo.tag]}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 600, color: convo.isGroup ? TEXT_SEC : tagColors[convo.tag]
                }}>
                  {convo.avatar}
                </div>
                {convo.online && (
                  <div style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 12, height: 12, borderRadius: "50%",
                    background: "#22c55e", border: `2px solid ${WHITE}`
                  }} />
                )}
              </div>
              
              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{convo.name}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 600, color: tagColors[convo.tag],
                    background: `${tagColors[convo.tag]}15`, padding: "2px 6px",
                    borderRadius: 6, textTransform: "uppercase"
                  }}>{convo.tag}</span>
                </div>
                <p style={{
                  fontSize: 13, color: TEXT_SEC, margin: 0,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                }}>{convo.lastMessage}</p>
              </div>
              
              {/* Meta */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <span style={{ fontSize: 11, color: TEXT_SEC }}>{convo.time}</span>
                {convo.unread > 0 && (
                  <div style={{
                    minWidth: 18, height: 18, borderRadius: 9,
                    background: TEAL, color: WHITE, fontSize: 11, fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 5px"
                  }}>{convo.unread}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main - Message View */}
      <div style={{ 
        flex: 1, display: isMobile && !selectedConvo ? "none" : "flex", 
        flexDirection: "column", background: WHITE 
      }}>
        {selectedConvo ? (
          <>
            {/* Convo Header */}
            <div style={{
              padding: isMobile ? "12px 16px" : "14px 24px", borderBottom: `1px solid ${BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {isMobile && (
                  <button
                    onClick={() => setSelectedConvo(null)}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: "none",
                      background: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", color: TEXT_SEC, marginRight: 4
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="15,18 9,12 15,6"/>
                    </svg>
                  </button>
                )}
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: selectedConvo.isGroup ? "#f0f4f3" : `${tagColors[selectedConvo.tag]}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 600, color: selectedConvo.isGroup ? TEXT_SEC : tagColors[selectedConvo.tag]
                }}>
                  {selectedConvo.avatar}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>{selectedConvo.name}</div>
                  <div style={{ fontSize: 12, color: TEXT_SEC }}>
                    {selectedConvo.online ? "Online" : selectedConvo.members ? `${selectedConvo.members} members` : "Offline"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{
                  width: 36, height: 36, borderRadius: 10, border: `1px solid ${BORDER}`,
                  background: WHITE, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: TEXT_SEC
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </button>
                <button style={{
                  width: 36, height: 36, borderRadius: 10, border: `1px solid ${BORDER}`,
                  background: WHITE, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: TEXT_SEC
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                  </svg>
                </button>
                <button style={{
                  width: 36, height: 36, borderRadius: 10, border: `1px solid ${BORDER}`,
                  background: WHITE, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: TEXT_SEC
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                  </svg>
                </button>
                <button 
                  onClick={onClose}
                  style={{
                    width: 36, height: 36, borderRadius: 10, border: `1px solid ${BORDER}`,
                    background: WHITE, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: TEXT_SEC, transition: "all 0.15s ease"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = TEXT_SEC; e.currentTarget.style.color = TEXT; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT_SEC; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Sample messages */}
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${tagColors[selectedConvo.tag]}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 600, color: tagColors[selectedConvo.tag]
                  }}>{selectedConvo.avatar}</div>
                  <div>
                    <div style={{
                      background: "#f0f4f3", padding: "12px 16px", borderRadius: "4px 16px 16px 16px",
                      maxWidth: 320
                    }}>
                      <p style={{ margin: 0, fontSize: 14, color: TEXT, lineHeight: 1.5 }}>
                        Hey! Just wanted to check in about my progress this week.
                      </p>
                    </div>
                    <span style={{ fontSize: 11, color: TEXT_SEC, marginTop: 4, display: "block" }}>10:32 AM</span>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <div>
                    <div style={{
                      background: TEAL, padding: "12px 16px", borderRadius: "16px 4px 16px 16px",
                      maxWidth: 320
                    }}>
                      <p style={{ margin: 0, fontSize: 14, color: WHITE, lineHeight: 1.5 }}>
                        {selectedConvo.lastMessage}
                      </p>
                    </div>
                    <span style={{ fontSize: 11, color: TEXT_SEC, marginTop: 4, display: "block", textAlign: "right" }}>Just now</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Input */}
            <div style={{ padding: "16px 24px", borderTop: `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                <button style={{
                  width: 40, height: 40, borderRadius: 10, border: `1px solid ${BORDER}`,
                  background: WHITE, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: TEXT_SEC, flexShrink: 0
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
                <div style={{
                  flex: 1, background: "#f5f7f6", borderRadius: 12,
                  display: "flex", alignItems: "flex-end", padding: "4px 4px 4px 16px"
                }}>
                  <textarea
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    rows={1}
                    style={{
                      flex: 1, border: "none", background: "transparent", outline: "none",
                      fontSize: 14, color: TEXT, resize: "none", padding: "8px 0",
                      maxHeight: 120
                    }}
                  />
                  <button style={{
                    width: 36, height: 36, borderRadius: 10, border: "none",
                    background: messageInput.trim() ? TEAL : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: messageInput.trim() ? "pointer" : "default",
                    color: messageInput.trim() ? WHITE : TEXT_SEC,
                    transition: "all 0.15s ease"
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/>
                    </svg>
                  </button>
                </div>
                <button style={{
                  width: 40, height: 40, borderRadius: 10, border: `1px solid ${BORDER}`,
                  background: WHITE, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: TEXT_SEC, flexShrink: 0
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", padding: 48, position: "relative"
          }}>
            <button 
              onClick={onClose}
              style={{
                position: "absolute", top: 16, right: 16,
                width: 36, height: 36, borderRadius: 10, border: `1px solid ${BORDER}`,
                background: WHITE, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: TEXT_SEC, transition: "all 0.15s ease"
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = TEXT_SEC; e.currentTarget.style.color = TEXT; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT_SEC; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div style={{
              width: 80, height: 80, borderRadius: 20, background: "#f0f4f3",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 24, color: TEXT_SEC
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: TEXT, margin: "0 0 8px" }}>
              Select a conversation
            </h3>
            <p style={{ fontSize: 14, color: TEXT_SEC, margin: 0, textAlign: "center", maxWidth: 280 }}>
              Choose a chat from the sidebar or start a new conversation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ScheduleCanvas({ onClose, isMobile }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 15)); // March 15, 2026
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState("week"); // week or month
  const [mobileSelectedDay, setMobileSelectedDay] = useState(0); // 0-6 for day of week on mobile
  
  const categories = [
    { id: "session", label: "Sessions", color: TEAL },
    { id: "meeting", label: "Meetings", color: "#6366f1" },
    { id: "backoffice", label: "Back Office", color: "#f59e0b" },
    { id: "work", label: "Work Hours", color: "#94a3b8" }
  ];
  
  const events = [
    { id: 1, title: "Sarah Chen - Check-in", category: "session", day: 0, start: 9, duration: 1 },
    { id: 2, title: "Marcus Johnson - Training", category: "session", day: 0, start: 14, duration: 1.5 },
    { id: 3, title: "Team Standup", category: "meeting", day: 1, start: 10, duration: 0.5 },
    { id: 4, title: "Emily Rodriguez - Assessment", category: "session", day: 1, start: 13, duration: 1 },
    { id: 5, title: "Content Planning", category: "backoffice", day: 2, start: 9, duration: 2 },
    { id: 6, title: "Alex Kim - Progress Review", category: "session", day: 2, start: 15, duration: 1 },
    { id: 7, title: "Client Onboarding Call", category: "meeting", day: 3, start: 11, duration: 1 },
    { id: 8, title: "Program Updates", category: "backoffice", day: 3, start: 14, duration: 1.5 },
    { id: 9, title: "Group Session - Nutrition", category: "session", day: 4, start: 10, duration: 1.5 },
    { id: 10, title: "Admin & Billing", category: "backoffice", day: 4, start: 16, duration: 1 },
  ];
  
  const workHours = { start: 8, end: 18 };
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());
  
  const getCategoryColor = (cat) => categories.find(c => c.id === cat)?.color || TEXT_SEC;
  
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fafcfb" }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px", borderBottom: `1px solid ${BORDER}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", background: WHITE, gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
          {/* Navigation */}
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => {
                if (isMobile) {
                  // Navigate by day on mobile
                  if (mobileSelectedDay > 0) {
                    setMobileSelectedDay(mobileSelectedDay - 1);
                  } else {
                    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
                    setMobileSelectedDay(6);
                  }
                } else {
                  setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
                }
              }}
              style={{
                width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`,
                background: WHITE, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: TEXT_SEC
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
            </button>
            <button
              onClick={() => {
                if (isMobile) {
                  // Navigate by day on mobile
                  if (mobileSelectedDay < 6) {
                    setMobileSelectedDay(mobileSelectedDay + 1);
                  } else {
                    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)));
                    setMobileSelectedDay(0);
                  }
                } else {
                  setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)));
                }
              }}
              style={{
                width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`,
                background: WHITE, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: TEXT_SEC
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="9,18 15,12 9,6"/>
              </svg>
            </button>
          </div>
          {/* Date display - show full date on mobile, month/year on desktop */}
          {isMobile ? (
            <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>
              {(() => {
                const dayDate = new Date(weekStart);
                dayDate.setDate(weekStart.getDate() + mobileSelectedDay);
                return dayDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
              })()}
            </span>
          ) : (
            <span style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>
              {weekStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          )}
          <button
            onClick={() => {
              setCurrentDate(new Date(2026, 2, 15));
              if (isMobile) setMobileSelectedDay(0);
            }}
            style={{
              padding: "6px 12px", borderRadius: 8, border: `1px solid ${BORDER}`,
              background: WHITE, cursor: "pointer", fontSize: 12, fontWeight: 500, color: TEXT_SEC
            }}
          >
            Today
          </button>
        </div>
        
        {/* Categories Legend + Close */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 16 }}>
          {!isMobile && categories.map(cat => (
            <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: cat.color }} />
              <span style={{ fontSize: 12, color: TEXT_SEC }}>{cat.label}</span>
            </div>
          ))}
          {!isMobile && (
            <div
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8, marginLeft: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: TEXT_SEC, border: `1px solid ${BORDER}`,
                background: WHITE, transition: "all 0.15s ease"
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = TEXT_SEC; e.currentTarget.style.color = TEXT; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT_SEC; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Categories Legend */}
      {isMobile && (
        <div style={{ 
          display: "flex", gap: 12, padding: "10px 16px", 
          background: WHITE, borderBottom: `1px solid ${BORDER}`,
          overflowX: "auto"
        }}>
          {categories.map(cat => (
            <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: cat.color }} />
              <span style={{ fontSize: 11, color: TEXT_SEC }}>{cat.label}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Calendar Grid */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Time Column */}
        <div style={{ width: isMobile ? 45 : 60, borderRight: `1px solid ${BORDER}`, background: WHITE, flexShrink: 0 }}>
          {!isMobile && <div style={{ height: 48, borderBottom: `1px solid ${BORDER}` }} />}
          {Array.from({ length: workHours.end - workHours.start }, (_, i) => (
            <div key={i} style={{
              height: isMobile ? 50 : 60, borderBottom: `1px solid ${BORDER}`,
              display: "flex", alignItems: "flex-start", justifyContent: "flex-end",
              padding: isMobile ? "2px 4px" : "4px 8px", fontSize: isMobile ? 10 : 11, color: TEXT_SEC, fontWeight: 500
            }}>
              {((workHours.start + i) % 12 || 12)}{(workHours.start + i) >= 12 ? "pm" : "am"}
            </div>
          ))}
        </div>
        
        {/* Days Grid */}
        <div style={{ flex: 1, display: "flex", overflowX: isMobile ? "hidden" : "auto" }} className="hide-scrollbar">
          {(isMobile ? [days[mobileSelectedDay]] : days).map((day, idx) => {
            const dayIdx = isMobile ? mobileSelectedDay : idx;
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + dayIdx);
            const isToday = dayDate.toDateString() === new Date(2026, 2, 15).toDateString();
            const isWeekend = dayIdx === 0 || dayIdx === 6;
            const dayEvents = events.filter(e => e.day === dayIdx);
            
            return (
              <div key={dayIdx} style={{ flex: 1, minWidth: isMobile ? "100%" : 100, borderRight: isMobile ? "none" : `1px solid ${BORDER}` }}>
                {/* Day Header - hidden on mobile since date is in nav */}
                {!isMobile && (
                  <div style={{
                    height: 48, borderBottom: `1px solid ${BORDER}`,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    background: isToday ? TEAL_LIGHT : WHITE
                  }}>
                    <span style={{ fontSize: 11, color: TEXT_SEC, fontWeight: 500 }}>{day}</span>
                    <span style={{
                      fontSize: 16, fontWeight: 600,
                      width: 28, height: 28, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isToday ? TEAL : "transparent",
                      color: isToday ? WHITE : TEXT
                    }}>
                      {dayDate.getDate()}
                    </span>
                  </div>
                )}
                
                {/* Time Slots */}
                <div style={{ position: "relative", background: isWeekend ? "#fafafa" : WHITE }}>
                  {Array.from({ length: workHours.end - workHours.start }, (_, i) => (
                    <div key={i} style={{ height: isMobile ? 50 : 60, borderBottom: `1px solid ${BORDER}` }} />
                  ))}
                  
                  {/* Events */}
                  {dayEvents.map(event => {
                    const slotHeight = isMobile ? 50 : 60;
                    return (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      style={{
                        position: "absolute",
                        top: (event.start - workHours.start) * slotHeight + 2,
                        left: isMobile ? 8 : 2, right: isMobile ? 8 : 2,
                        height: event.duration * slotHeight - 4,
                        background: `${getCategoryColor(event.category)}15`,
                        borderLeft: `3px solid ${getCategoryColor(event.category)}`,
                        borderRadius: 8, padding: isMobile ? "8px 12px" : "6px 8px",
                        cursor: "pointer", overflow: "hidden",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={e => { if (!isMobile) e.currentTarget.style.background = `${getCategoryColor(event.category)}25`; }}
                      onMouseLeave={e => { if (!isMobile) e.currentTarget.style.background = `${getCategoryColor(event.category)}15`; }}
                    >
                      <div style={{
                        fontSize: isMobile ? 14 : 12, fontWeight: 600, color: getCategoryColor(event.category),
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                      }}>
                        {event.title}
                      </div>
                      <div style={{ fontSize: isMobile ? 12 : 10, color: TEXT_SEC, marginTop: 2 }}>
                        {((event.start) % 12 || 12)}{event.start >= 12 ? "pm" : "am"} · {event.duration}hr
                      </div>
                    </div>
                  );})}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Quick Add Bar */}
      <div style={{
        padding: isMobile ? "10px 12px" : "12px 20px", borderTop: `1px solid ${BORDER}`, background: WHITE,
        display: "flex", alignItems: "center", gap: isMobile ? 8 : 12,
        overflowX: "auto"
      }} className="hide-scrollbar">
        {!isMobile && <span style={{ fontSize: 12, color: TEXT_SEC, flexShrink: 0 }}>Quick add:</span>}
        {[
          { label: isMobile ? "+ Session" : "+ Session", cat: "session" },
          { label: isMobile ? "+ Meeting" : "+ Meeting", cat: "meeting" },
          { label: isMobile ? "+ Block" : "+ Block Time", cat: "backoffice" }
        ].map(btn => (
          <button
            key={btn.cat}
            style={{
              padding: isMobile ? "6px 10px" : "8px 14px", borderRadius: 8,
              border: `1px solid ${BORDER}`, background: WHITE,
              fontSize: isMobile ? 11 : 12, fontWeight: 500, color: getCategoryColor(btn.cat),
              cursor: "pointer", transition: "all 0.15s ease", flexShrink: 0
            }}
            onMouseEnter={e => { if (!isMobile) { e.currentTarget.style.background = `${getCategoryColor(btn.cat)}10`; e.currentTarget.style.borderColor = getCategoryColor(btn.cat); } }}
            onMouseLeave={e => { if (!isMobile) { e.currentTarget.style.background = WHITE; e.currentTarget.style.borderColor = BORDER; } }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessagesCanvas({ onClose, setChatMessages, setChatTyping }) {
  const [chatStep, setChatStep] = useState(0); // 0: who, 1: types, 2: frequency, 3: duration, 4: generating, 5: done
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [frequency, setFrequency] = useState(null);
  const [duration, setDuration] = useState(null);
  const [generatedMessages, setGeneratedMessages] = useState([]);
  const [expandedMessage, setExpandedMessage] = useState(null);
  
  const GREEN = "#5CDB95";
  
  const clients = [
    { name: "Sarah Chen", initials: "SC" },
    { name: "Marcus Johnson", initials: "MJ" },
    { name: "Emily Rodriguez", initials: "ER" },
    { name: "All Clients", initials: "ALL" }
  ];
  
  const messageTypes = [
    { id: "checkin", label: "Check-ins" },
    { id: "motivation", label: "Motivation" },
    { id: "reminder", label: "Reminders" },
    { id: "tips", label: "Tips & Education" }
  ];
  
  const frequencies = [
    { id: "daily", label: "Daily" },
    { id: "3x", label: "3x per week" },
    { id: "weekly", label: "Weekly" }
  ];
  
  const durations = [
    { id: "2weeks", label: "2 weeks" },
    { id: "4weeks", label: "4 weeks" },
    { id: "8weeks", label: "8 weeks" }
  ];
  
  const typeColors = {
    checkin: TEAL,
    motivation: "#f59e0b",
    reminder: "#6366f1",
    tips: "#ec4899"
  };
  
  // Handler refs to avoid stale closures
  const handleClientSelectRef = useRef(null);
  const handleTypesSelectRef = useRef(null);
  const handleFrequencySelectRef = useRef(null);
  const handleDurationSelectRef = useRef(null);
  
  const handleClientSelect = (clientName) => {
    const client = clients.find(c => c.name === clientName) || { name: clientName };
    setSelectedClient(client);
    // Mark previous options as answered
    setChatMessages(prev => prev.map(m => m.options ? { ...m, answered: true } : m));
    setChatMessages(prev => [...prev, { type: "user", text: clientName }]);
    setChatTyping(true);
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        type: "ai",
        text: `Great! What types of messages do you want to send to ${client.name === "All Clients" ? "all your clients" : client.name}? You can pick multiple.`,
        options: messageTypes.map(t => t.label),
        multiSelect: true,
        onSelect: (val) => handleTypesSelectRef.current?.(val)
      }]);
      setChatTyping(false);
      setChatStep(1);
    }, 500);
  };
  
  const handleTypesSelect = (selected) => {
    const typeIds = selected.map(label => messageTypes.find(t => t.label === label)?.id).filter(Boolean);
    setSelectedTypes(typeIds);
    setChatMessages(prev => prev.map(m => m.options ? { ...m, answered: true } : m));
    setChatMessages(prev => [...prev, { type: "user", text: selected.join(", ") }]);
    setChatTyping(true);
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        type: "ai",
        text: "How often should messages go out?",
        options: frequencies.map(f => f.label),
        onSelect: (val) => handleFrequencySelectRef.current?.(val)
      }]);
      setChatTyping(false);
      setChatStep(2);
    }, 500);
  };
  
  const handleFrequencySelect = (freqLabel) => {
    const freq = frequencies.find(f => f.label === freqLabel)?.id || "weekly";
    setFrequency(freq);
    setChatMessages(prev => prev.map(m => m.options ? { ...m, answered: true } : m));
    setChatMessages(prev => [...prev, { type: "user", text: freqLabel }]);
    setChatTyping(true);
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        type: "ai",
        text: "How long should this sequence run?",
        options: durations.map(d => d.label),
        onSelect: (val) => handleDurationSelectRef.current?.(val)
      }]);
      setChatTyping(false);
      setChatStep(3);
    }, 500);
  };
  
  const handleDurationSelect = (durLabel) => {
    const dur = durations.find(d => d.label === durLabel)?.id || "4weeks";
    setDuration(dur);
    setChatMessages(prev => prev.map(m => m.options ? { ...m, answered: true } : m));
    setChatMessages(prev => [...prev, { type: "user", text: durLabel }]);
    setChatTyping(true);
    setChatStep(4);
    
    // Generate messages
    setTimeout(() => {
      const msgs = generateMessagesWithParams(dur);
      setGeneratedMessages(msgs);
      setChatMessages(prev => [...prev, {
        type: "ai",
        text: `Done! I've created ${msgs.length} messages for ${selectedClient?.name || "your clients"}. Review them in the timeline and activate when you're ready.`
      }]);
      setChatTyping(false);
      setChatStep(5);
    }, 2000);
  };
  
  const generateMessagesWithParams = (dur) => {
    const name = selectedClient?.name === "All Clients" ? "team" : selectedClient?.name?.split(' ')[0];
    const weeksNum = dur === "2weeks" ? 2 : dur === "4weeks" ? 4 : 8;
    const messages = [];
    
    const typeContents = {
      checkin: ["How are you feeling today?", "Quick check-in - how's your energy?", "What's one win from this week?"],
      motivation: ["You're doing amazing!", "Remember why you started.", "Every step counts."],
      reminder: ["Don't forget your session today!", "Time for your workout!", "Meal prep reminder!"],
      tips: ["Try drinking water before meals.", "Sleep is key to recovery.", "Consistency beats perfection."]
    };
    
    let msgId = 1;
    for (let week = 1; week <= Math.min(weeksNum, 4); week++) {
      selectedTypes.forEach((type, typeIdx) => {
        const dayOffset = typeIdx * (7 / selectedTypes.length);
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const dayName = days[Math.floor(dayOffset) % 7];
        const contents = typeContents[type];
        messages.push({
          id: msgId++,
          week,
          day: dayName,
          time: `${9 + typeIdx * 3}:00 AM`,
          type: messageTypes.find(t => t.id === type)?.label,
          typeId: type,
          content: `Hey ${name}! ${contents[week % contents.length]}`,
          status: "scheduled"
        });
      });
    }
    return messages;
  };
  
  // Keep refs updated
  handleClientSelectRef.current = handleClientSelect;
  handleTypesSelectRef.current = handleTypesSelect;
  handleFrequencySelectRef.current = handleFrequencySelect;
  handleDurationSelectRef.current = handleDurationSelect;
  
// Initialize with first question - starts fresh chat, runs once on mount
  useEffect(() => {
  if (setChatMessages) {
  // Start fresh chat with just the message builder question
  setChatMessages([{
  type: "ai",
  text: "Let's set up your automated message sequence. Who should receive these messages?",
  options: clients.map(c => c.name),
  onSelect: (val) => handleClientSelectRef.current?.(val)
  }]);
  }
  }, []);
  
  return (
    <div style={{ display: "flex", height: "100%", background: "#fafcfb", position: "relative" }}>
      {/* Close button */}
      <div
        onClick={onClose}
        style={{
          position: "absolute", top: 16, right: 16, zIndex: 10,
          width: 32, height: 32, borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: TEXT_SEC, opacity: 0.6,
          background: "rgba(255,255,255,0.9)", border: `1px solid ${BORDER}`,
          transition: "all 0.15s ease"
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = TEXT; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = 0.6; e.currentTarget.style.color = TEXT_SEC; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </div>
      
      {/* Timeline Preview Panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: WHITE, overflow: "hidden" }}>
        {/* Header */}
<div style={{
  padding: "16px 56px 16px 24px", borderBottom: `1px solid ${BORDER}`,
  display: "flex", alignItems: "center", justifyContent: "space-between"
  }}>
  <div>
  <h2 style={{ fontSize: 16, fontWeight: 600, color: TEXT, margin: 0 }}>Message Sequence</h2>
  <p style={{ fontSize: 12, color: TEXT_SEC, margin: "4px 0 0" }}>
  {chatStep < 5 ? "Building your sequence..." : `${generatedMessages.length} messages scheduled`}
  </p>
  </div>
  {chatStep === 5 && (
  <button style={{
  padding: "10px 20px", borderRadius: 10, border: "none",
  background: GREEN, color: WHITE, fontSize: 13, fontWeight: 600, cursor: "pointer"
  }}>
  Activate
  </button>
  )}
  </div>
        
        {/* Timeline Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          {chatStep < 4 ? (
            /* Building Animation */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <div style={{
                width: 80, height: 80, borderRadius: 20, background: `${GREEN}10`,
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/>
                </svg>
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: TEXT, marginBottom: 8 }}>
                {chatStep === 0 && "Let's set up your messages"}
                {chatStep === 1 && "Great choice!"}
                {chatStep === 2 && "Adding message types..."}
                {chatStep === 3 && "Almost there..."}
              </div>
              <div style={{ fontSize: 14, color: TEXT_SEC }}>
                Answer the questions to build your sequence
              </div>
              
{/* Progress dots with bounce animation */}
  <div style={{ display: "flex", gap: 8, marginTop: 32, height: 20, alignItems: "center" }}>
  {[0, 1, 2, 3].map(i => (
  <div key={i} style={{
  width: 8, height: 8, borderRadius: "50%",
  background: i <= chatStep ? GREEN : BORDER,
  transition: "background 0.3s ease",
  animation: i <= chatStep ? `dotBounce 1.2s ease-in-out ${i * 0.15}s infinite` : "none"
  }} />
  ))}
  </div>
            </div>
          ) : chatStep === 4 ? (
            /* Generating Animation */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <div style={{
                width: 80, height: 80, borderRadius: 20, background: `${GREEN}15`,
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
                animation: "pulse 1.5s ease-in-out infinite"
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: TEXT, marginBottom: 8 }}>
                Generating messages...
              </div>
              <div style={{ fontSize: 14, color: TEXT_SEC }}>
                Crafting personalized content for {selectedClient?.name}
              </div>
            </div>
          ) : (
            /* Mailchimp-style Vertical Timeline */
            <div style={{ maxWidth: 500, margin: "0 auto" }}>
              {/* Group by week */}
              {[...new Set(generatedMessages.map(m => m.week))].map(week => (
                <div key={week} style={{ marginBottom: 32 }}>
                  <div style={{ 
                    fontSize: 11, fontWeight: 600, color: TEXT_SEC, 
                    textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 
                  }}>
                    Week {week}
                  </div>
                  
                  {/* Timeline */}
                  <div style={{ position: "relative", paddingLeft: 24 }}>
                    {/* Vertical line */}
                    <div style={{
                      position: "absolute", left: 5, top: 8, bottom: 8,
                      width: 2, background: BORDER, borderRadius: 1
                    }} />
                    
                    {generatedMessages.filter(m => m.week === week).map((msg, idx) => (
                      <div 
                        key={msg.id}
                        onClick={() => setExpandedMessage(expandedMessage === msg.id ? null : msg.id)}
                        style={{ 
                          position: "relative", marginBottom: 16, cursor: "pointer",
                          animation: `fadeSlideIn 0.4s ease ${idx * 0.1}s both`
                        }}
                      >
                        {/* Timeline dot */}
                        <div style={{
                          position: "absolute", left: -24, top: 12,
                          width: 12, height: 12, borderRadius: "50%",
                          background: typeColors[msg.typeId] || TEAL,
                          border: `2px solid ${WHITE}`
                        }} />
                        
                        {/* Card */}
                        <div style={{
                          background: "#fafcfb", borderRadius: 12, 
                          border: `1px solid ${expandedMessage === msg.id ? typeColors[msg.typeId] : BORDER}`,
                          overflow: "hidden", transition: "all 0.2s ease"
                        }}>
                          {/* Card header */}
                          <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                              padding: "4px 10px", borderRadius: 6,
                              background: `${typeColors[msg.typeId]}15`,
                              color: typeColors[msg.typeId],
                              fontSize: 11, fontWeight: 600
                            }}>
                              {msg.type}
                            </div>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>{msg.day}</span>
                              <span style={{ fontSize: 12, color: TEXT_SEC, marginLeft: 8 }}>{msg.time}</span>
                            </div>
                            <svg 
                              width="16" height="16" viewBox="0 0 24 24" 
                              fill="none" stroke={TEXT_SEC} strokeWidth="2" strokeLinecap="round"
                              style={{ 
                                transform: expandedMessage === msg.id ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.2s ease"
                              }}
                            >
                              <polyline points="6,9 12,15 18,9"/>
                            </svg>
                          </div>
                          
                          {/* Expanded content */}
                          {expandedMessage === msg.id && (
                            <div style={{ 
                              padding: "0 16px 16px", borderTop: `1px solid ${BORDER}`,
                              paddingTop: 12, animation: "fadeIn 0.2s ease"
                            }}>
                              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: TEXT }}>
                                {msg.content}
                              </p>
                              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                                <button style={{
                                  padding: "6px 12px", borderRadius: 6, border: `1px solid ${BORDER}`,
                                  background: WHITE, color: TEXT_SEC, fontSize: 11, fontWeight: 500, cursor: "pointer"
                                }}>Edit</button>
                                <button style={{
                                  padding: "6px 12px", borderRadius: 6, border: `1px solid ${BORDER}`,
                                  background: WHITE, color: TEXT_SEC, fontSize: 11, fontWeight: 500, cursor: "pointer"
                                }}>Reschedule</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CanvasTemplates({ onSelect, onClose, isMobile }) {
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  
  const templates = [
    { 
      id: "workout",
      icon: "chart", 
      title: "Workout Builder", 
      desc: "Design structured training programs with exercises and progressions",
      color: "#3aafa9",
      available: true,
      number: 1
    },
    { 
      id: "mealPlan",
      icon: "calendar", 
      title: "Meal Plan", 
      desc: "Build custom nutrition plans with daily meals, macros, and recipes",
      color: "#2B7A78",
      available: false,
      comingSoon: true
    },
    { 
      id: "messages",
      icon: "send", 
      title: "Automated Messages", 
      desc: "Schedule check-ins, reminders, and motivational messages",
      color: "#5CDB95",
      available: false,
      comingSoon: true
    },
    { 
      id: "reports",
      icon: "file", 
      title: "Progress Reports", 
      desc: "Generate comprehensive client progress summaries",
      color: "#45818e",
      available: false,
      comingSoon: true
    }
  ];
  
  return (
    <div style={{ 
      display: "flex", flexDirection: "column", height: "100%", 
      position: "relative", background: "#fafcfb"
    }}>
      {/* Close button - only on desktop, mobile uses header back button */}
      {!isMobile && (
        <div 
          onClick={onClose}
          style={{ 
            position: "absolute", top: 16, right: 16, zIndex: 10,
            width: 32, height: 32, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: TEXT_SEC, opacity: 0.6,
            background: "rgba(255,255,255,0.9)", border: `1px solid ${BORDER}`,
            transition: "all 0.15s ease"
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = TEXT; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = 0.6; e.currentTarget.style.color = TEXT_SEC; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
      )}
      
      {/* Main content */}
      <div style={{ 
        flex: 1, display: "flex", flexDirection: "column",
        padding: isMobile ? "20px 16px 24px" : "60px 48px 48px", overflowY: "auto"
      }}>
        {/* Header */}
        <div style={{ marginBottom: isMobile ? 24 : 40 }}>
          {!isMobile && (
            <div style={{ 
              display: "inline-flex", alignItems: "center", gap: 8,
              background: TEAL_LIGHT, padding: "6px 12px", borderRadius: 20,
              marginBottom: 16
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: TEAL }}>Canvas</span>
            </div>
          )}
          <h1 style={{ 
            fontSize: isMobile ? 24 : 32, fontWeight: 700, color: TEXT, margin: 0,
            letterSpacing: "-0.02em", lineHeight: 1.2
          }}>
            What would you like to create?
          </h1>
          <p style={{ 
            fontSize: isMobile ? 14 : 15, color: TEXT_SEC, margin: "12px 0 0", 
            maxWidth: 400, lineHeight: 1.5
          }}>
            Choose a template to get started. Milton will help you build and customize it.
          </p>
        </div>
        
        {/* Templates Grid */}
        <div style={{ 
          display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", 
          gap: isMobile ? 12 : 16, maxWidth: isMobile ? "100%" : 600
        }}>
          {templates.map((template, idx) => (
            <div
              key={template.id}
              onClick={() => template.available && onSelect(template.id)}
              onMouseEnter={() => template.available && setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              style={{
                background: WHITE,
                borderRadius: 16,
                border: `1px solid ${hoveredTemplate === template.id ? template.color : BORDER}`,
                padding: 24,
                cursor: template.available ? "pointer" : "default",
                opacity: template.available ? 1 : 0.5,
                transition: "all 0.2s ease",
                transform: hoveredTemplate === template.id ? "translateY(-2px)" : "translateY(0)",
                boxShadow: hoveredTemplate === template.id 
                  ? `0 8px 24px rgba(43,122,120,0.15)` 
                  : "0 2px 8px rgba(0,0,0,0.04)",
                animation: `fadeSlideIn 0.4s ease ${idx * 0.08}s both`
              }}
            >
              {/* Icon */}
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: template.available 
                  ? (hoveredTemplate === template.id ? template.color : `${template.color}15`)
                  : "#f0f0f0",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16, transition: "all 0.2s ease",
                color: template.available 
                  ? (hoveredTemplate === template.id ? WHITE : template.color)
                  : TEXT_SEC
              }}>
                <NavIcon icon={template.icon} size={24} />
              </div>
              
              {/* Title + Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                {template.number && (
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: template.color, color: WHITE,
                    fontSize: 12, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>{template.number}</span>
                )}
                <h3 style={{ 
                  fontSize: 16, fontWeight: 600, color: template.available ? TEXT : TEXT_SEC, margin: 0 
                }}>
                  {template.title}
                </h3>
                {template.comingSoon && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: TEXT_SEC,
                    background: "#e8e8e8", padding: "4px 10px", borderRadius: 10,
                    textTransform: "uppercase", letterSpacing: "0.03em"
                  }}>Coming Soon</span>
                )}
              </div>
              
              {/* Description */}
              <p style={{ 
                fontSize: 13, color: TEXT_SEC, margin: 0, lineHeight: 1.5 
              }}>
                {template.desc}
              </p>
              
              {/* Arrow indicator for available templates */}
              {template.available && (
                <div style={{
                  marginTop: 16, display: "flex", alignItems: "center", gap: 6,
                  color: hoveredTemplate === template.id ? template.color : TEXT_SEC,
                  fontSize: 13, fontWeight: 500, transition: "all 0.2s ease"
                }}>
                  <span>Get started</span>
                  <svg 
                    width="14" height="14" viewBox="0 0 24 24" 
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    style={{ 
                      transform: hoveredTemplate === template.id ? "translateX(4px)" : "translateX(0)",
                      transition: "transform 0.2s ease"
                    }}
                  >
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12,5 19,12 12,19"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Bottom hint */}
        <div style={{
          marginTop: 40, padding: "16px 20px", background: "#f0f4f3",
          borderRadius: 12, display: "flex", alignItems: "center", gap: 12,
          maxWidth: 600
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: WHITE,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: TEAL
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>
              Describe what you need in chat
            </div>
            <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2 }}>
              Milton can also create these from natural language requests
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MealPlanCanvas({ data, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState(null);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Fetch AI-generated recipes on mount
  useEffect(() => {
    let cancelled = false;
    
    async function generateRecipes() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate progress for UX
        const progressInterval = setInterval(() => {
          setLoadingProgress(prev => Math.min(prev + Math.random() * 15, 90));
        }, 500);
        
        const response = await fetch('/api/generate-recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientName: data?.client || 'Client',
            goals: data?.goals || 'General health and fitness',
            restrictions: data?.restrictions || null,
            dailyCalories: data?.weeklyTargets?.calories || 2000,
            dailyProtein: data?.weeklyTargets?.protein || 150,
            weeksToGenerate: 4
          })
        });
        
        clearInterval(progressInterval);
        
        if (!response.ok) {
          throw new Error('Failed to generate recipes');
        }
        
        const result = await response.json();
        
        if (!cancelled) {
          setLoadingProgress(100);
          setTimeout(() => {
            setMealPlan(result.mealPlan);
            setIsLoading(false);
          }, 300);
        }
      } catch (err) {
        console.error('[v0] Recipe generation error:', err);
        if (!cancelled) {
          setError(err.message);
          // Fall back to sample data
          setMealPlan(getFallbackMealPlan());
          setIsLoading(false);
        }
      }
    }
    
    generateRecipes();
    
    return () => { cancelled = true; };
  }, [data]);
  
  // Fallback sample data if API fails
  function getFallbackMealPlan() {
    return {
      weeks: [1, 2, 3, 4].map(weekNum => ({
        weekNumber: weekNum,
        breakfast: [
          { name: "Greek Yogurt Parfait", calories: 320, protein: 22, carbs: 35, fat: 8, prepTime: "5 min", ingredients: ["Greek yogurt", "Granola", "Mixed berries", "Honey"] },
          { name: "Avocado Toast & Eggs", calories: 450, protein: 18, carbs: 32, fat: 28, prepTime: "10 min", ingredients: ["Whole grain bread", "Avocado", "Eggs", "Everything seasoning"] },
          { name: "Protein Smoothie Bowl", calories: 380, protein: 28, carbs: 45, fat: 12, prepTime: "8 min", ingredients: ["Protein powder", "Frozen banana", "Almond milk", "Chia seeds"] }
        ],
        snack: [
          { name: "Mixed Nuts & Berries", calories: 180, protein: 6, carbs: 15, fat: 12, prepTime: "2 min", ingredients: ["Almonds", "Walnuts", "Blueberries", "Raspberries"] },
          { name: "Cottage Cheese Cup", calories: 150, protein: 14, carbs: 8, fat: 5, prepTime: "2 min", ingredients: ["Low-fat cottage cheese", "Pineapple chunks", "Cinnamon"] },
          { name: "Protein Energy Bites", calories: 200, protein: 12, carbs: 22, fat: 8, prepTime: "1 min", ingredients: ["Oats", "Protein powder", "Peanut butter", "Dark chocolate chips"] }
        ],
        lunch: [
          { name: "Grilled Chicken Salad", calories: 420, protein: 38, carbs: 18, fat: 22, prepTime: "15 min", ingredients: ["Chicken breast", "Mixed greens", "Cherry tomatoes", "Feta cheese", "Olive oil dressing"] },
          { name: "Quinoa Buddha Bowl", calories: 480, protein: 22, carbs: 58, fat: 18, prepTime: "20 min", ingredients: ["Quinoa", "Chickpeas", "Roasted vegetables", "Tahini dressing"] },
          { name: "Turkey Avocado Wrap", calories: 380, protein: 28, carbs: 32, fat: 16, prepTime: "10 min", ingredients: ["Whole wheat wrap", "Turkey slices", "Avocado", "Spinach", "Mustard"] }
        ],
        dinner: [
          { name: "Salmon with Vegetables", calories: 520, protein: 42, carbs: 25, fat: 28, prepTime: "25 min", ingredients: ["Salmon fillet", "Asparagus", "Sweet potato", "Lemon", "Olive oil"] },
          { name: "Lean Beef Stir Fry", calories: 480, protein: 38, carbs: 35, fat: 20, prepTime: "20 min", ingredients: ["Sirloin strips", "Broccoli", "Bell peppers", "Brown rice", "Soy sauce"] },
          { name: "Herb Grilled Chicken", calories: 440, protein: 45, carbs: 22, fat: 18, prepTime: "22 min", ingredients: ["Chicken breast", "Italian herbs", "Roasted zucchini", "Quinoa"] }
        ]
      }))
    };
  }
  
  if (!data) return null;
  
  const mealCategories = ["Breakfast", "Snack", "Lunch", "Dinner"];
  
  // Recipe images from Unsplash (food photography)
  const recipeImages = {
    Breakfast: [
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=300&h=200&fit=crop"
    ],
    Snack: [
      "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=300&h=200&fit=crop"
    ],
    Lunch: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&h=200&fit=crop"
    ],
    Dinner: [
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop"
    ]
  };
  
  // Use AI-generated recipes or fallback
  const weeks = mealPlan?.weeks || [];
  
  // Loading state - AI generating recipes
  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative", background: "#fafcfb" }}>
        {/* Close button */}
        <div 
          onClick={onClose}
          style={{ 
            position: "absolute", top: 16, right: 16, zIndex: 10,
            width: 32, height: 32, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: TEXT_SEC, opacity: 0.4,
            background: "rgba(255,255,255,0.9)", border: `1px solid ${BORDER}`
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        
        {/* Loading content */}
        <div style={{ 
          flex: 1, display: "flex", flexDirection: "column", 
          alignItems: "center", justifyContent: "center", padding: 40
        }}>
          {/* AI animation */}
          <div style={{ 
            width: 80, height: 80, borderRadius: 20, 
            background: `linear-gradient(135deg, ${TEAL} 0%, #1f8785 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 24, boxShadow: "0 8px 32px rgba(43,122,120,0.3)",
            animation: "pulseGlow 2s ease-in-out infinite"
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          
          <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
            Generating Personalized Recipes
          </div>
          <div style={{ fontSize: 13, color: TEXT_SEC, marginBottom: 24, textAlign: "center", maxWidth: 280 }}>
            Milton is creating {data?.client ? `a custom meal plan for ${data.client}` : "your personalized meal plan"} based on nutritional goals
          </div>
          
          {/* Progress bar */}
          <div style={{ 
            width: 240, height: 6, borderRadius: 3, background: BORDER, overflow: "hidden"
          }}>
            <div style={{ 
              width: `${loadingProgress}%`, height: "100%", 
              background: `linear-gradient(90deg, ${TEAL} 0%, #1f8785 100%)`,
              borderRadius: 3, transition: "width 0.3s ease"
            }} />
          </div>
          <div style={{ fontSize: 11, color: TEXT_SEC, marginTop: 8 }}>
            {loadingProgress < 30 ? "Analyzing nutritional requirements..." : 
             loadingProgress < 60 ? "Selecting optimal recipes..." :
             loadingProgress < 90 ? "Calculating macros..." : "Finalizing meal plan..."}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative", background: "#fafcfb" }}>
      {/* Subtle close button */}
      <div 
        onClick={onClose}
        style={{ 
          position: "absolute", top: 16, right: 16, zIndex: 10,
          width: 32, height: 32, borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: TEXT_SEC, opacity: 0.4,
          background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)",
          border: `1px solid ${BORDER}`,
          transition: "all 0.2s ease"
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = WHITE; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = 0.4; e.currentTarget.style.background = "rgba(255,255,255,0.9)"; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </div>
      
      {/* Header */}
      <div style={{ 
        padding: "24px 28px 20px", 
        background: `linear-gradient(135deg, ${WHITE} 0%, #f7fafa 100%)`,
        borderBottom: `1px solid ${BORDER}`,
        animation: "fadeUp 0.5s ease-out forwards"
      }}>
        <div style={{ 
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "4px 12px 4px 8px", borderRadius: 20,
          background: TEAL_LIGHT, marginBottom: 12,
          fontSize: 11, fontWeight: 600, color: TEAL,
          textTransform: "uppercase", letterSpacing: "0.05em"
        }}>
          <div style={{ 
            width: 6, height: 6, borderRadius: "50%", background: TEAL,
            animation: "pulseGlow 2s ease-in-out infinite"
          }} />
          {error ? "Sample Plan" : "AI-Generated"}
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>
          Personalized Meal Plan
        </div>
        <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 4 }}>
          {data.client ? `Custom recipes for ${data.client}` : "AI-generated recipes based on your goals"}
        </div>
      </div>
      
      {/* Scrollable weeks content - each week is one horizontal row */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 0" }}>
        {weeks.map((week, weekIdx) => {
          const weekNum = week.weekNumber || weekIdx + 1;
          
          // Map category names to the API data keys
          const categoryDataMap = {
            "Breakfast": week.breakfast || [],
            "Snack": week.snack || [],
            "Lunch": week.lunch || [],
            "Dinner": week.dinner || []
          };
          
          return (
          <div 
            key={weekNum}
            style={{
              marginBottom: 24,
              opacity: 0,
              animation: `fadeUp 0.5s ease-out ${0.2 + weekIdx * 0.12}s forwards`
            }}
          >
            {/* Week label - sticky on left */}
            <div style={{ 
              display: "flex", alignItems: "center", gap: 10, 
              padding: "0 24px", marginBottom: 12
            }}>
              <div style={{ 
                width: 32, height: 32, borderRadius: 8, 
                background: `linear-gradient(135deg, ${TEAL} 0%, #1f8785 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: WHITE, fontSize: 13, fontWeight: 700,
                boxShadow: "0 3px 10px rgba(43,122,120,0.25)"
              }}>
                {weekNum}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Week {weekNum}</div>
              <div style={{ fontSize: 12, color: TEXT_SEC }}>
                {data.weeklyTargets?.calories || 2000} cal/day
              </div>
            </div>
            
            {/* Horizontal scrolling row with ALL meals for this week */}
            <div style={{ 
              display: "flex", gap: 16, overflowX: "auto", 
              paddingBottom: 8, paddingLeft: 24, paddingRight: 24,
              scrollbarWidth: "none", msOverflowStyle: "none"
            }} className="hide-scrollbar">
              {/* Iterate through each meal category inline */}
              {mealCategories.map((category, catIdx) => {
                const categoryColor = category === "Breakfast" ? "#f59e0b" : 
                                     category === "Snack" ? "#8b5cf6" : 
                                     category === "Lunch" ? "#10b981" : "#3b82f6";
                const recipes = categoryDataMap[category] || [];
                
                return (
                  <div key={category} style={{ display: "contents" }}>
                    {/* Category divider with label */}
                    <div style={{ 
                      display: "flex", flexDirection: "column", alignItems: "center", 
                      justifyContent: "center", minWidth: 70, padding: "8px 0",
                      opacity: 0,
                      animation: `fadeUp 0.4s ease-out ${0.25 + weekIdx * 0.12 + catIdx * 0.05}s forwards`
                    }}>
                      <div style={{ 
                        width: 8, height: 8, borderRadius: "50%", 
                        background: categoryColor, marginBottom: 6,
                        boxShadow: `0 2px 8px ${categoryColor}40`
                      }} />
                      <div style={{ 
                        fontSize: 10, fontWeight: 600, color: TEXT_SEC, 
                        textTransform: "uppercase", letterSpacing: "0.04em",
                        writingMode: "vertical-rl", textOrientation: "mixed",
                        transform: "rotate(180deg)"
                      }}>
                        {category}
                      </div>
                    </div>
                    
                    {/* Recipe cards for this category */}
                    {recipes.map((recipe, recipeIdx) => (
                      <div
                        key={`${category}-${recipeIdx}`}
                        style={{
                          minWidth: 160, maxWidth: 160,
                          background: WHITE, borderRadius: 14,
                          border: `1px solid ${BORDER}`,
                          overflow: "hidden",
                          cursor: "pointer",
                          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          opacity: 0, transform: "scale(0.92) translateX(16px)",
                          animation: `canvasCellReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${0.3 + weekIdx * 0.12 + catIdx * 0.08 + recipeIdx * 0.04}s forwards`
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = "scale(1.04) translateY(-4px)";
                          e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.12)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = "scale(1) translateY(0)";
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                        }}
                      >
                        {/* Recipe image */}
                        <div style={{ 
                          height: 90, 
                          background: `linear-gradient(135deg, ${categoryColor}15 0%, ${categoryColor}08 100%)`,
                          position: "relative", overflow: "hidden"
                        }}>
                          <img 
                            src={recipeImages[category][recipeIdx]}
                            alt={recipe.name}
                            crossOrigin="anonymous"
                            style={{ 
                              width: "100%", height: "100%", objectFit: "cover",
                              transition: "transform 0.3s ease"
                            }}
                            onError={e => {
                              e.target.style.display = "none";
                            }}
                          />
                          {/* Category color accent bar */}
                          <div style={{
                            position: "absolute", top: 0, left: 0, right: 0, height: 3,
                            background: categoryColor
                          }} />
                          {/* Prep time badge */}
                          <div style={{
                            position: "absolute", bottom: 6, right: 6,
                            background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
                            padding: "2px 6px", borderRadius: 6,
                            fontSize: 9, fontWeight: 600, color: WHITE
                          }}>
                            {recipe.prepTime || recipe.time}
                          </div>
                        </div>
                        
                        {/* Recipe details */}
                        <div style={{ padding: 10 }}>
                          <div style={{ 
                            fontSize: 12, fontWeight: 600, color: TEXT, 
                            marginBottom: 5, lineHeight: 1.3,
                            overflow: "hidden", textOverflow: "ellipsis",
                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
                          }}>
                            {recipe.name}
                          </div>
                          <div style={{ 
                            display: "flex", gap: 6, fontSize: 10, color: TEXT_SEC 
                          }}>
                            <span style={{ fontWeight: 600, color: TEXT }}>{recipe.calories}</span>
                            <span>cal</span>
                            <span style={{ opacity: 0.3 }}>|</span>
                            <span style={{ fontWeight: 600, color: categoryColor }}>{recipe.protein}g</span>
                            <span>pro</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
              
              {/* Add more card at the end of the row */}
              <div
                style={{
                  minWidth: 100, maxWidth: 100,
                  background: "transparent", borderRadius: 14,
                  border: `2px dashed ${BORDER}`,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  cursor: "pointer", padding: 12,
                  transition: "all 0.2s ease",
                  opacity: 0,
                  animation: `fadeUp 0.4s ease-out ${0.7 + weekIdx * 0.12}s forwards`
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = TEAL;
                  e.currentTarget.style.background = TEAL_LIGHT;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = BORDER;
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div style={{ 
                  width: 28, height: 28, borderRadius: 8, 
                  background: "#f0f4f3", 
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 6
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEXT_SEC} strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <span style={{ fontSize: 10, color: TEXT_SEC, fontWeight: 500, textAlign: "center" }}>
                  More
                </span>
              </div>
            </div>
          </div>
        );
        })}
        
        {/* Load more indicator */}
        <div style={{ 
          padding: "16px 24px 32px", textAlign: "center",
          opacity: 0, animation: "fadeUp 0.4s ease-out 1s forwards"
        }}>
          <div style={{ 
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 18px", borderRadius: 10,
            background: WHITE, border: `1px solid ${BORDER}`,
            fontSize: 12, color: TEXT_SEC, cursor: "pointer",
            transition: "all 0.2s ease"
          }}
            onMouseEnter={e => { e.currentTarget.style.background = TEAL_LIGHT; e.currentTarget.style.color = TEAL; }}
            onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.color = TEXT_SEC; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
            Generate more weeks
          </div>
        </div>
      </div>
      
      {/* Hint bar */}
      <div style={{
        padding: "14px 20px", borderTop: `1px solid ${BORDER}`,
        background: WHITE, fontSize: 13, color: TEXT_SEC,
        display: "flex", alignItems: "center", gap: 10
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: 8, background: TEAL_LIGHT,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span>Click a recipe to customize or ask Milton for alternatives</span>
      </div>
    </div>
  );
}

function WorkoutCanvas({ data, onClose, onSave, clients = [] }) {
  const [weekView, setWeekView] = useState(4); // Always 4 weeks
  const [expandedDay, setExpandedDay] = useState(null); // { weekNum, dayIdx, workout, dayLabel, date }
  const [editingCell, setEditingCell] = useState(null); // { rowIdx, field }
  const [exercises, setExercises] = useState([]); // Local copy of exercises for editing
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: "", sets: "", reps: "", weight: "", rest: "60-90s" });
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved'
  const [selectedClient, setSelectedClient] = useState(data?.client || "");
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  
  // Calendar month navigation
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  
  // Get the first Monday of the month or the last Monday of previous month
  const getFirstMondayOfView = (date) => {
    const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfWeek = firstOfMonth.getDay();
    // Adjust to get to Monday (0 = Sunday, 1 = Monday, etc.)
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const firstMonday = new Date(firstOfMonth);
    firstMonday.setDate(firstOfMonth.getDate() - daysToSubtract);
    return firstMonday;
  };
  
  // Navigate months
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  // Format month name
  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  // When expandedDay changes, copy exercises to local state
  useEffect(() => {
    if (expandedDay?.workout?.exercises) {
      setExercises(expandedDay.workout.exercises.map((ex, idx) => ({
        ...ex,
        rest: ex.rest || (idx < 2 ? "90-120s" : idx < 4 ? "60-90s" : "45-60s")
      })));
      setHasChanges(false);
      setSaveStatus(null);
    }
  }, [expandedDay]);
  
  // Handle cell edit
  const handleCellChange = (rowIdx, field, value) => {
    setExercises(prev => prev.map((ex, idx) => 
      idx === rowIdx ? { ...ex, [field]: value } : ex
    ));
    setHasChanges(true);
    setSaveStatus(null);
  };
  
  // Handle save
  const handleSave = () => {
    if (!expandedDay || !hasChanges) return;
    
    setSaveStatus('saving');
    
    // Simulate save delay for UX feedback
    setTimeout(() => {
      // Update the expandedDay's workout with new exercises
      const updatedWorkout = {
        ...expandedDay.workout,
        exercises: exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          rest: ex.rest
        }))
      };
      
      // Call onSave if provided (to update parent state)
      if (onSave) {
        onSave({
          weekNum: expandedDay.weekNum,
          dayIdx: expandedDay.dayIdx,
          workout: updatedWorkout
        });
      }
      
      // Update local expandedDay state
      setExpandedDay(prev => ({
        ...prev,
        workout: updatedWorkout
      }));
      
      setHasChanges(false);
      setSaveStatus('saved');
      
      // Clear saved status after 2 seconds
      setTimeout(() => setSaveStatus(null), 2000);
    }, 500);
  };
  
  // Handle adding new exercise
  const handleAddExercise = () => {
    if (newExercise.name.trim()) {
      setExercises(prev => [...prev, { 
        ...newExercise, 
        sets: newExercise.sets || "3",
        reps: newExercise.reps || "10",
        weight: newExercise.weight || "BW",
        rest: newExercise.rest || "60-90s"
      }]);
      setNewExercise({ name: "", sets: "", reps: "", weight: "", rest: "60-90s" });
      setIsAddingRow(false);
      setHasChanges(true);
      setSaveStatus(null);
    }
  };
  
  // Handle delete exercise
  const handleDeleteExercise = (rowIdx) => {
    setExercises(prev => prev.filter((_, idx) => idx !== rowIdx));
    setHasChanges(true);
    setSaveStatus(null);
  };
  
  if (!data) return null;
  
  const dayLabels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  
  // Sample workout data for each day type
  const workoutTemplates = {
    push: {
      title: "PUSH: CHEST & SHOULDERS",
      exercises: [
        { name: "Barbell Bench Press", sets: 4, reps: "8, 8, 6, 6", weight: "155 lb" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10, 10, 8", weight: "50 lb" },
        { name: "Barbell Shoulder Press", sets: 3, reps: "8, 8, 8", weight: "95 lb" },
      ]
    },
    pull: {
      title: "PULL: BACK & BICEPS",
      exercises: [
        { name: "Barbell Deadlift", sets: 4, reps: "6, 6, 5, 5", weight: "225 lb" },
        { name: "Seated Cable Row", sets: 3, reps: "10, 10, 8", weight: "120 lb" },
        { name: "Barbell Curl", sets: 3, reps: "12, 10, 8", weight: "65 lb" },
      ]
    },
    legs: {
      title: "LEGS: SQUAT & DEADLIFT",
      exercises: [
        { name: "Barbell Full Squat", sets: 4, reps: "8, 8, 6, 6", weight: "185 lb" },
        { name: "Romanian Deadlift", sets: 3, reps: "10, 10, 8", weight: "135 lb" },
        { name: "Leg Press", sets: 3, reps: "12, 12, 10", weight: "270 lb" },
      ]
    },
    upper: {
      title: "FULL BODY: STRENGTH +",
      exercises: [
        { name: "Barbell Deadlift", sets: 3, reps: "10-12 reps", weight: "185 lb" },
        { name: "Bird Dog", sets: 3, reps: "8-10 reps", weight: "BW" },
        { name: "Dumbbell Front Raise", sets: 3, reps: "10-12 reps", weight: "15 lb" },
      ]
    },
    rest: null
  };
  
  // Define weekly schedule - which workout type for each day
  const weekSchedules = [
    ["upper", "rest", "pull", "rest", "legs", "rest", "rest"],
    ["push", "rest", "pull", "rest", "legs", "rest", "rest"],
    ["upper", "rest", "push", "rest", "pull", "rest", "rest"],
    ["legs", "rest", "upper", "rest", "push", "rest", "rest"],
  ];
  
  const weeks = Array.from({ length: weekView }, (_, i) => i + 1);
  
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative", background: "#fafcfb" }}>
      {/* Header */}
      <div style={{ 
        padding: "20px 24px", 
        background: WHITE,
        borderBottom: `1px solid ${BORDER}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        animation: "fadeUp 0.4s ease-out forwards",
        position: "relative",
        zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ 
            width: 36, height: 36, borderRadius: 10, 
            background: TEAL_LIGHT,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>Workout Calendar</div>
            <div style={{ fontSize: 12, color: TEXT_SEC }}>{data.programName || "Training Program"}</div>
          </div>
        </div>
        
        {/* Month Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={goToPrevMonth}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: WHITE, border: `1px solid ${BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: TEXT_SEC,
              transition: "all 0.15s ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = TEAL_LIGHT; e.currentTarget.style.color = TEAL; e.currentTarget.style.borderColor = TEAL; }}
            onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.color = TEXT_SEC; e.currentTarget.style.borderColor = BORDER; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
          </button>
          
          <div style={{ 
            minWidth: 160, textAlign: "center",
            fontSize: 15, fontWeight: 600, color: TEXT
          }}>
            {formatMonth(currentDate)}
          </div>
          
          <button
            onClick={goToNextMonth}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: WHITE, border: `1px solid ${BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: TEXT_SEC,
              transition: "all 0.15s ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = TEAL_LIGHT; e.currentTarget.style.color = TEAL; e.currentTarget.style.borderColor = TEAL; }}
            onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.color = TEXT_SEC; e.currentTarget.style.borderColor = BORDER; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="9,6 15,12 9,18"/>
            </svg>
          </button>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Client Dropdown */}
          <div style={{ position: "relative", zIndex: 9999 }}>
            <button
              onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 14px", borderRadius: 8,
                background: selectedClient ? TEAL_LIGHT : "#f0f4f3",
                border: `1px solid ${selectedClient ? TEAL : BORDER}`,
                cursor: "pointer", fontSize: 13, fontWeight: 500,
                color: selectedClient ? TEAL : TEXT_SEC,
                transition: "all 0.15s ease"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>{selectedClient || "Select Client"}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: isClientDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s ease" }}>
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {isClientDropdownOpen && (
              <div style={{
                position: "absolute", top: "100%", right: 0, marginTop: 4,
                background: WHITE, borderRadius: 8, border: `1px solid ${BORDER}`,
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                minWidth: 220, maxHeight: 280, overflowY: "auto",
                zIndex: 9999,
                animation: "fadeUp 0.15s ease-out"
              }}>
                {clients.length > 0 ? clients.map((client, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setSelectedClient(client.name); setIsClientDropdownOpen(false); }}
                    style={{
                      padding: "10px 12px", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 10,
                      background: selectedClient === client.name ? TEAL_LIGHT : "transparent",
                      borderBottom: idx < clients.length - 1 ? `1px solid ${BORDER}` : "none",
                      transition: "background 0.15s ease"
                    }}
                    onMouseEnter={e => { if (selectedClient !== client.name) e.currentTarget.style.background = "#f5f7f6"; }}
                    onMouseLeave={e => { if (selectedClient !== client.name) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: `linear-gradient(135deg, ${TEAL}, ${SAGE})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: WHITE, fontSize: 11, fontWeight: 600
                    }}>
                      {client.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>{client.name}</div>
                      <div style={{ fontSize: 10, color: TEXT_SEC }}>{client.program || "No program"}</div>
                    </div>
                    {selectedClient === client.name && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" style={{ marginLeft: "auto" }}>
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                    )}
                  </div>
                )) : (
                  <div style={{ padding: "12px", color: TEXT_SEC, fontSize: 12, textAlign: "center" }}>
                    No clients available
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Save button */}
          <div 
            onClick={() => {
              if (selectedClient) {
                alert(`Program assigned to ${selectedClient}!`);
              } else {
                alert("Please select a client first.");
              }
            }}
            title="Save & Assign"
            style={{ 
              width: 32, height: 32, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: WHITE, 
              border: "none", background: TEAL,
              transition: "all 0.15s ease",
              boxShadow: "0 2px 6px rgba(76, 139, 129, 0.3)"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#3d7a6e"; e.currentTarget.style.boxShadow = "0 4px 10px rgba(76, 139, 129, 0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = TEAL; e.currentTarget.style.boxShadow = "0 2px 6px rgba(76, 139, 129, 0.3)"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
          </div>
          
          {/* Close button */}
          <div 
            onClick={onClose}
            style={{ 
              width: 32, height: 32, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: TEXT_SEC, 
              border: `1px solid ${BORDER}`, background: WHITE,
              transition: "all 0.15s ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f5f7f6"; }}
            onMouseLeave={e => { e.currentTarget.style.background = WHITE; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Calendar grid - weeks as rows, days as columns */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "auto", padding: "16px 0", scrollbarWidth: "none", msOverflowStyle: "none" }} className="hide-scrollbar">
        {weeks.map((weekNum, weekIdx) => {
          const schedule = weekSchedules[(weekNum - 1) % weekSchedules.length];
          const firstMonday = getFirstMondayOfView(currentDate);
          
          return (
            <div 
              key={weekNum}
              style={{
                display: "flex", gap: 0, marginBottom: 20, paddingLeft: 16,
                opacity: 0,
                animation: `fadeUp 0.5s ease-out ${0.15 + weekIdx * 0.1}s forwards`
              }}
            >
              {/* Days columns */}
              <div style={{ 
                display: "flex", gap: 8, overflowX: "auto", paddingRight: 16,
                paddingBottom: 8, scrollbarWidth: "none", msOverflowStyle: "none"
              }} className="hide-scrollbar">
                {dayLabels.map((day, dayIdx) => {
                  const workoutType = schedule[dayIdx];
                  const workout = workoutTemplates[workoutType];
                  const isRest = !workout;
                  const animDelay = 0.2 + weekIdx * 0.1 + dayIdx * 0.03;
                  
                  // Calculate the actual date for this cell
                  const cellDate = new Date(firstMonday);
                  cellDate.setDate(firstMonday.getDate() + (weekIdx * 7) + dayIdx);
                  const dayNumber = cellDate.getDate();
                  const isCurrentMonth = cellDate.getMonth() === currentDate.getMonth();
                  const isToday = cellDate.toDateString() === new Date().toDateString();
                  
                  return (
                    <div
                      key={`${weekNum}-${day}-${dayNumber}`}
                      onClick={() => !isRest && setExpandedDay({ weekNum, dayIdx, workout, dayLabel: day, date: cellDate })}
                      style={{
                        minWidth: 160, width: 160,
                        background: WHITE, borderRadius: 12,
                        border: isToday ? `2px solid ${TEAL}` : `1px solid ${BORDER}`,
                        overflow: "hidden",
                        opacity: 0, transform: "scale(0.95)",
                        animation: `canvasCellReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${animDelay}s forwards`,
                        display: "flex", flexDirection: "column",
                        cursor: isRest ? "default" : "pointer",
                        transition: "box-shadow 0.2s ease, transform 0.2s ease"
                      }}
                      onMouseEnter={e => { if (!isRest) { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "scale(1.02)"; }}}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "scale(1)"; }}
                    >
                      {/* Day header */}
                      <div style={{ 
                        padding: "8px 12px", 
                        borderBottom: isRest ? "none" : `1px solid ${BORDER}`,
                        background: isToday ? TEAL_LIGHT : (isRest ? "#fafcfb" : WHITE),
                        display: "flex", alignItems: "center", justifyContent: "space-between"
                      }}>
                        <div style={{ 
                          fontSize: 10, fontWeight: 600, color: isCurrentMonth ? TEXT_SEC : "#c0c8c5",
                          textTransform: "uppercase", letterSpacing: "0.04em"
                        }}>
                          {day}
                        </div>
                        <div style={{ 
                          fontSize: 13, fontWeight: isToday ? 700 : 600, 
                          minWidth: 24, height: 24, 
                          display: "flex", alignItems: "center", justifyContent: "center",
                          borderRadius: "50%",
                          background: isToday ? TEAL : "transparent",
                          color: isToday ? WHITE : (isCurrentMonth ? TEXT : "#c0c8c5")
                        }}>
                          {dayNumber}
                        </div>
                      </div>
                      
                      {/* Workout content or rest */}
                      {isRest ? (
                        <div style={{ 
                          flex: 1, minHeight: 120, 
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: TEXT_SEC, fontSize: 11, fontStyle: "italic"
                        }}>
                          Rest
                        </div>
                      ) : (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                          {/* Workout title */}
                          <div style={{ 
                            padding: "8px 10px", 
                            background: TEAL_LIGHT,
                            borderBottom: `1px solid ${BORDER}`
                          }}>
                            <div style={{ 
                              fontSize: 10, fontWeight: 700, color: TEXT,
                              textTransform: "uppercase", letterSpacing: "0.02em",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                            }}>
                              {workout.title}
                            </div>
                          </div>
                          
                          {/* Exercises list */}
                          <div style={{ flex: 1, padding: "6px 0" }}>
                            {workout.exercises.map((ex, exIdx) => (
                              <div
                                key={exIdx}
                                style={{
                                  padding: "6px 10px",
                                  display: "flex", alignItems: "flex-start", gap: 8,
                                  borderBottom: exIdx < workout.exercises.length - 1 ? `1px solid #f0f4f3` : "none",
                                  cursor: "pointer",
                                  transition: "background 0.15s ease"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#fafcfb"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                              >
                                <div style={{ 
                                  fontSize: 10, fontWeight: 600, color: TEAL,
                                  minWidth: 20
                                }}>
                                  {ex.sets}x
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ 
                                    fontSize: 12, fontWeight: 600, color: TEXT,
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                                  }}>
                                    {ex.name}
                                  </div>
                                  <div style={{ 
                                    fontSize: 10, color: TEXT_SEC, marginTop: 2,
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                                  }}>
                                    {ex.reps}, {ex.weight}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer bar */}
      <div style={{
        padding: "12px 20px", borderTop: `1px solid ${BORDER}`,
        background: WHITE, fontSize: 12, color: TEXT_SEC,
        display: "flex", alignItems: "center", gap: 10
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6, background: TEAL_LIGHT,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span>Click any workout day to expand it</span>
      </div>
      
      {/* Expanded Day Overlay */}
      {expandedDay && (
        <div 
          style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: WHITE, zIndex: 100,
            display: "flex", flexDirection: "column",
            animation: "fadeUp 0.3s ease-out forwards"
          }}
        >
          {/* Expanded Header */}
          <div style={{ 
            padding: "20px 24px", 
            background: WHITE,
            borderBottom: `1px solid ${BORDER}`,
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => setExpandedDay(null)}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "#f0f4f3", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.15s ease"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = TEAL_LIGHT; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f0f4f3"; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2" strokeLinecap="round">
                  <polyline points="15,18 9,12 15,6"/>
                </svg>
              </button>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>
                  Week {expandedDay.weekNum} - {expandedDay.dayLabel}
                </div>
                <div style={{ fontSize: 12, color: TEXT_SEC }}>
                  {expandedDay.workout?.title || "Workout Day"}
                </div>
              </div>
            </div>
            
          </div>
          
          {/* Expanded Content - Spreadsheet Style */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {/* Spreadsheet Table */}
            <div style={{ flex: 1, overflow: "auto" }}>
              <table style={{ 
                width: "100%", borderCollapse: "collapse", 
                fontSize: 13, tableLayout: "fixed"
              }}>
                {/* Header Row */}
                <thead>
                  <tr style={{ background: "#f8faf9", position: "sticky", top: 0, zIndex: 10 }}>
                    <th style={{ 
                      width: 40, padding: "12px 8px", 
                      borderBottom: `2px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`,
                      fontWeight: 600, color: TEXT_SEC, fontSize: 11, 
                      textTransform: "uppercase", letterSpacing: "0.03em",
                      textAlign: "center"
                    }}>#</th>
                    <th style={{ 
                      width: "35%", padding: "12px 16px", 
                      borderBottom: `2px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`,
                      fontWeight: 600, color: TEXT_SEC, fontSize: 11, 
                      textTransform: "uppercase", letterSpacing: "0.03em",
                      textAlign: "left"
                    }}>Exercise</th>
                    <th style={{ 
                      width: "10%", padding: "12px 12px", 
                      borderBottom: `2px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`,
                      fontWeight: 600, color: TEXT_SEC, fontSize: 11, 
                      textTransform: "uppercase", letterSpacing: "0.03em",
                      textAlign: "center"
                    }}>Sets</th>
                    <th style={{ 
                      width: "15%", padding: "12px 12px", 
                      borderBottom: `2px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`,
                      fontWeight: 600, color: TEXT_SEC, fontSize: 11, 
                      textTransform: "uppercase", letterSpacing: "0.03em",
                      textAlign: "center"
                    }}>Reps</th>
                    <th style={{ 
                      width: "15%", padding: "12px 12px", 
                      borderBottom: `2px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`,
                      fontWeight: 600, color: TEXT_SEC, fontSize: 11, 
                      textTransform: "uppercase", letterSpacing: "0.03em",
                      textAlign: "center"
                    }}>Weight</th>
                    <th style={{ 
                      width: "15%", padding: "12px 12px", 
                      borderBottom: `2px solid ${BORDER}`,
                      fontWeight: 600, color: TEXT_SEC, fontSize: 11, 
                      textTransform: "uppercase", letterSpacing: "0.03em",
                      textAlign: "center"
                    }}>Rest</th>
                  </tr>
                </thead>
                <tbody>
                  {exercises.map((ex, exIdx) => {
                    const isEditing = (field) => editingCell?.rowIdx === exIdx && editingCell?.field === field;
                    
                    const EditableCell = ({ field, value, style, inputStyle }) => (
                      <td 
                        style={{ 
                          ...style,
                          cursor: "text",
                          position: "relative"
                        }}
                        onClick={() => setEditingCell({ rowIdx: exIdx, field })}
                      >
                        {isEditing(field) ? (
                          <input
                            autoFocus
                            value={value}
                            onChange={(e) => handleCellChange(exIdx, field, e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") setEditingCell(null);
                              if (e.key === "Tab") {
                                e.preventDefault();
                                const fields = ["name", "sets", "reps", "weight", "rest"];
                                const currentIdx = fields.indexOf(field);
                                const nextField = fields[(currentIdx + 1) % fields.length];
                                setEditingCell({ rowIdx: exIdx, field: nextField });
                              }
                            }}
                            style={{
                              width: "100%", border: "none", outline: "none",
                              background: "transparent", fontSize: "inherit",
                              fontWeight: "inherit", color: "inherit",
                              textAlign: "inherit", padding: 0,
                              ...inputStyle
                            }}
                          />
                        ) : (
                          value
                        )}
                      </td>
                    );
                    
                    return (
                      <tr 
                        key={exIdx}
                        style={{ 
                          background: exIdx % 2 === 0 ? WHITE : "#fafcfb",
                          transition: "background 0.15s ease"
                        }}
                        onMouseEnter={e => { if (!editingCell) e.currentTarget.style.background = TEAL_LIGHT; }}
                        onMouseLeave={e => e.currentTarget.style.background = exIdx % 2 === 0 ? WHITE : "#fafcfb"}
                      >
                        {/* Row Number */}
                        <td style={{ 
                          padding: "14px 8px", 
                          borderBottom: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`,
                          textAlign: "center", fontWeight: 600, color: TEXT_SEC, fontSize: 12
                        }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                            {exIdx + 1}
                            <button
                              onClick={() => handleDeleteExercise(exIdx)}
                              style={{
                                width: 18, height: 18, borderRadius: 4, border: "none",
                                background: "transparent", cursor: "pointer", color: TEXT_SEC,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                opacity: 0.5, transition: "all 0.15s ease"
                              }}
                              onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = "#ef4444"; }}
                              onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.color = TEXT_SEC; }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                        
                        {/* Exercise Name */}
                        <td 
                          style={{ 
                            padding: "14px 16px", 
                            borderBottom: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`,
                            fontWeight: 600, color: TEXT, cursor: "text"
                          }}
                          onClick={() => setEditingCell({ rowIdx: exIdx, field: "name" })}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                              background: TEAL, color: WHITE,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 11, fontWeight: 700
                            }}>
                              {ex.name.charAt(0) || "?"}
                            </div>
                            {isEditing("name") ? (
                              <input
                                autoFocus
                                value={ex.name}
                                onChange={(e) => handleCellChange(exIdx, "name", e.target.value)}
                                onBlur={() => setEditingCell(null)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") setEditingCell(null);
                                  if (e.key === "Tab") {
                                    e.preventDefault();
                                    setEditingCell({ rowIdx: exIdx, field: "sets" });
                                  }
                                }}
                                style={{
                                  flex: 1, border: "none", outline: "none",
                                  background: "transparent", fontSize: 13,
                                  fontWeight: 600, color: TEXT, padding: 0
                                }}
                              />
                            ) : (
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {ex.name}
                              </span>
                            )}
                          </div>
                        </td>
                        
                        {/* Sets */}
                        <EditableCell 
                          field="sets" 
                          value={ex.sets}
                          style={{ 
                            padding: "14px 12px", 
                            borderBottom: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`,
                            textAlign: "center", fontWeight: 700, color: TEXT, fontSize: 14
                          }}
                          inputStyle={{ textAlign: "center" }}
                        />
                        
                        {/* Reps */}
                        <td 
                          style={{ 
                            padding: "14px 12px", 
                            borderBottom: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`,
                            textAlign: "center", color: TEXT, cursor: "text"
                          }}
                          onClick={() => setEditingCell({ rowIdx: exIdx, field: "reps" })}
                        >
                          {isEditing("reps") ? (
                            <input
                              autoFocus
                              value={ex.reps}
                              onChange={(e) => handleCellChange(exIdx, "reps", e.target.value)}
                              onBlur={() => setEditingCell(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") setEditingCell(null);
                                if (e.key === "Tab") {
                                  e.preventDefault();
                                  setEditingCell({ rowIdx: exIdx, field: "weight" });
                                }
                              }}
                              style={{
                                width: "100%", border: "none", outline: "none",
                                background: "transparent", fontSize: 12,
                                fontWeight: 600, color: TEXT, textAlign: "center", padding: 0
                              }}
                            />
                          ) : (
                            <div style={{ 
                              display: "inline-block", padding: "4px 10px", 
                              background: "#f0f4f3", borderRadius: 4,
                              fontWeight: 600, fontSize: 12
                            }}>{ex.reps}</div>
                          )}
                        </td>
                        
                        {/* Weight */}
                        <td 
                          style={{ 
                            padding: "14px 12px", 
                            borderBottom: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`,
                            textAlign: "center", fontWeight: 700, color: TEAL, fontSize: 14, cursor: "text"
                          }}
                          onClick={() => setEditingCell({ rowIdx: exIdx, field: "weight" })}
                        >
                          {isEditing("weight") ? (
                            <input
                              autoFocus
                              value={ex.weight}
                              onChange={(e) => handleCellChange(exIdx, "weight", e.target.value)}
                              onBlur={() => setEditingCell(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") setEditingCell(null);
                                if (e.key === "Tab") {
                                  e.preventDefault();
                                  setEditingCell({ rowIdx: exIdx, field: "rest" });
                                }
                              }}
                              style={{
                                width: "100%", border: "none", outline: "none",
                                background: "transparent", fontSize: 14,
                                fontWeight: 700, color: TEAL, textAlign: "center", padding: 0
                              }}
                            />
                          ) : ex.weight}
                        </td>
                        
                        {/* Rest Time */}
                        <td 
                          style={{ 
                            padding: "14px 12px", 
                            borderBottom: `1px solid ${BORDER}`,
                            textAlign: "center", cursor: "text"
                          }}
                          onClick={() => setEditingCell({ rowIdx: exIdx, field: "rest" })}
                        >
                          {isEditing("rest") ? (
                            <input
                              autoFocus
                              value={ex.rest}
                              onChange={(e) => handleCellChange(exIdx, "rest", e.target.value)}
                              onBlur={() => setEditingCell(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") setEditingCell(null);
                                if (e.key === "Tab") {
                                  e.preventDefault();
                                  // Move to next row's name or stay if last row
                                  if (exIdx < exercises.length - 1) {
                                    setEditingCell({ rowIdx: exIdx + 1, field: "name" });
                                  } else {
                                    setEditingCell(null);
                                  }
                                }
                              }}
                              style={{
                                width: "100%", border: "none", outline: "none",
                                background: "transparent", fontSize: 12,
                                fontWeight: 600, color: "#c2410c", textAlign: "center", padding: 0
                              }}
                            />
                          ) : (
                            <div style={{ 
                              display: "inline-flex", alignItems: "center", gap: 4,
                              padding: "4px 10px", background: "#fff7ed", 
                              borderRadius: 4, color: "#c2410c", fontWeight: 600, fontSize: 12
                            }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
                              </svg>
                              {ex.rest}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Add Row - inline form or button */}
                  {isAddingRow ? (
                    <tr style={{ background: TEAL_LIGHT }}>
                      <td style={{ 
                        padding: "14px 8px", 
                        borderBottom: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`,
                        textAlign: "center", fontWeight: 600, color: TEXT_SEC, fontSize: 12
                      }}>
                        {exercises.length + 1}
                      </td>
                      <td style={{ 
                        padding: "14px 16px", 
                        borderBottom: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                            background: TEAL, color: WHITE,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 700
                          }}>
                            {newExercise.name.charAt(0) || "+"}
                          </div>
                          <input
                            autoFocus
                            placeholder="Exercise name"
                            value={newExercise.name}
                            onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddExercise();
                              if (e.key === "Escape") { setIsAddingRow(false); setNewExercise({ name: "", sets: "", reps: "", weight: "", rest: "60-90s" }); }
                            }}
                            style={{
                              flex: 1, border: "none", outline: "none",
                              background: "transparent", fontSize: 13,
                              fontWeight: 600, color: TEXT, padding: 0
                            }}
                          />
                        </div>
                      </td>
                      <td style={{ 
                        padding: "14px 12px", 
                        borderBottom: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`,
                        textAlign: "center"
                      }}>
                        <input
                          placeholder="3"
                          value={newExercise.sets}
                          onChange={(e) => setNewExercise(prev => ({ ...prev, sets: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") handleAddExercise(); }}
                          style={{
                            width: "100%", border: "none", outline: "none",
                            background: "transparent", fontSize: 14,
                            fontWeight: 700, color: TEXT, textAlign: "center", padding: 0
                          }}
                        />
                      </td>
                      <td style={{ 
                        padding: "14px 12px", 
                        borderBottom: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`,
                        textAlign: "center"
                      }}>
                        <input
                          placeholder="10"
                          value={newExercise.reps}
                          onChange={(e) => setNewExercise(prev => ({ ...prev, reps: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") handleAddExercise(); }}
                          style={{
                            width: "100%", border: "none", outline: "none",
                            background: "transparent", fontSize: 12,
                            fontWeight: 600, color: TEXT, textAlign: "center", padding: 0
                          }}
                        />
                      </td>
                      <td style={{ 
                        padding: "14px 12px", 
                        borderBottom: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`,
                        textAlign: "center"
                      }}>
                        <input
                          placeholder="BW"
                          value={newExercise.weight}
                          onChange={(e) => setNewExercise(prev => ({ ...prev, weight: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") handleAddExercise(); }}
                          style={{
                            width: "100%", border: "none", outline: "none",
                            background: "transparent", fontSize: 14,
                            fontWeight: 700, color: TEAL, textAlign: "center", padding: 0
                          }}
                        />
                      </td>
                      <td style={{ 
                        padding: "14px 12px", 
                        borderBottom: `1px solid ${BORDER}`,
                        textAlign: "center"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                          <input
                            placeholder="60-90s"
                            value={newExercise.rest}
                            onChange={(e) => setNewExercise(prev => ({ ...prev, rest: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter") handleAddExercise(); }}
                            style={{
                              width: 60, border: "none", outline: "none",
                              background: "transparent", fontSize: 12,
                              fontWeight: 600, color: "#c2410c", textAlign: "center", padding: 0
                            }}
                          />
                          <button
                            onClick={handleAddExercise}
                            style={{
                              padding: "4px 8px", borderRadius: 4, border: "none",
                              background: TEAL, color: WHITE, fontSize: 11, fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            Add
                          </button>
                          <button
                            onClick={() => { setIsAddingRow(false); setNewExercise({ name: "", sets: "", reps: "", weight: "", rest: "60-90s" }); }}
                            style={{
                              padding: "4px 8px", borderRadius: 4, border: `1px solid ${BORDER}`,
                              background: WHITE, color: TEXT_SEC, fontSize: 11, fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}` }}>
                        <div 
                          onClick={() => setIsAddingRow(true)}
                          style={{ 
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            padding: "10px", borderRadius: 8, border: `1px dashed ${BORDER}`,
                            color: TEXT_SEC, cursor: "pointer", transition: "all 0.15s ease"
                          }}
                          onMouseEnter={e => { 
                            e.currentTarget.style.background = TEAL_LIGHT; 
                            e.currentTarget.style.borderColor = TEAL; 
                            e.currentTarget.style.color = TEAL; 
                          }}
                          onMouseLeave={e => { 
                            e.currentTarget.style.background = "transparent"; 
                            e.currentTarget.style.borderColor = BORDER; 
                            e.currentTarget.style.color = TEXT_SEC; 
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>Add exercise</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Summary Bar */}
            <div style={{ 
              padding: "12px 20px", background: "#f8faf9", 
              borderTop: `1px solid ${BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ fontSize: 12, color: TEXT_SEC }}>
                  <span style={{ fontWeight: 600, color: TEXT }}>{exercises.length}</span> exercises
                </div>
                <div style={{ fontSize: 12, color: TEXT_SEC }}>
                  <span style={{ fontWeight: 600, color: TEXT }}>
                    {exercises.reduce((sum, ex) => sum + parseInt(ex.sets || 0), 0)}
                  </span> total sets
                </div>
                <div style={{ fontSize: 12, color: TEXT_SEC }}>
                  Est. duration: <span style={{ fontWeight: 600, color: TEXT }}>45-60 min</span>
                </div>
              </div>
              <div style={{ 
                padding: "6px 12px", borderRadius: 6, 
                background: TEAL_LIGHT, fontSize: 11, fontWeight: 600, color: TEAL,
                display: "flex", alignItems: "center", gap: 6
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Click any cell to edit
              </div>
            </div>
          </div>
          
          {/* Footer Actions */}
          <div style={{
            padding: "16px 24px", borderTop: `1px solid ${BORDER}`,
            background: WHITE, display: "flex", alignItems: "center", justifyContent: "flex-end"
          }}>
            <button
                onClick={handleSave}
                disabled={!hasChanges || saveStatus === 'saving'}
                style={{
                  padding: "10px 20px", borderRadius: 8,
                  border: "none", 
                  background: saveStatus === 'saved' ? "#3aaf6a" : hasChanges ? TEAL : "#a0b8b5",
                  fontSize: 13, fontWeight: 600, color: WHITE,
                  cursor: hasChanges && saveStatus !== 'saving' ? "pointer" : "default", 
                  transition: "all 0.15s ease",
                  display: "flex", alignItems: "center", gap: 6,
                  opacity: hasChanges || saveStatus === 'saved' ? 1 : 0.7
                }}
                onMouseEnter={e => { if (hasChanges && saveStatus !== 'saving') e.currentTarget.style.background = "#236b69"; }}
                onMouseLeave={e => { e.currentTarget.style.background = saveStatus === 'saved' ? "#3aaf6a" : hasChanges ? TEAL : "#a0b8b5"; }}
              >
                {saveStatus === 'saving' && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                )}
                {saveStatus === 'saved' && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                )}
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
              </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageSequenceCanvas({ data, onClose }) {
  if (!data) return null;
  
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      {/* Subtle close button */}
      <div 
        onClick={onClose}
        style={{ 
          position: "absolute", top: 12, right: 12, zIndex: 10,
          width: 28, height: 28, borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: TEXT_SEC, opacity: 0.5,
          transition: "opacity 0.15s ease"
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </div>
      
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{data.campaignName}</div>
        <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2 }}>Message sequence for {data.client}</div>
      </div>
      
      {/* Timeline content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
          {/* Timeline line */}
          <div style={{
            position: "absolute", left: 15, top: 20, bottom: 20,
            width: 2, background: BORDER
          }} />
          
          {data.messages?.map((msg, mIdx) => (
            <div key={mIdx} style={{
              display: "flex", gap: 14, paddingLeft: 0, marginBottom: 16
            }}>
              {/* Timeline dot */}
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: msg.type === "email" ? "#3b82f6" : "#10b981",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, zIndex: 1
              }}>
                {msg.type === "email" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                )}
              </div>
              
              <div style={{
                flex: 1, background: WHITE, borderRadius: 10,
                border: `1px solid ${BORDER}`, overflow: "hidden"
              }}>
                <div style={{
                  padding: "10px 14px", background: "#f8faf9",
                  borderBottom: `1px solid ${BORDER}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ 
                      fontSize: 10, fontWeight: 600, color: "#fff",
                      background: msg.type === "email" ? "#3b82f6" : "#10b981",
                      padding: "2px 6px", borderRadius: 8, textTransform: "uppercase"
                    }}>
                      {msg.type}
                    </span>
                    <span style={{ fontSize: 11, color: TEXT_SEC }}>Day {msg.day}</span>
                  </div>
                  <span style={{ 
                    fontSize: 10, fontWeight: 500, color: "#f59e0b",
                    background: "#fef3c7", padding: "2px 6px", borderRadius: 8
                  }}>
                    {msg.status}
                  </span>
                </div>
                <div style={{ padding: 12 }}>
                  {msg.subject && (
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 6 }}>
                      {msg.subject}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: TEXT_SEC, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                    {msg.body.length > 150 ? msg.body.substring(0, 150) + "..." : msg.body}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Hint bar */}
      <div style={{
        padding: "12px 16px", borderTop: `1px solid ${BORDER}`,
        background: "#fafcfb", fontSize: 12, color: TEXT_SEC
      }}>
        Chat with Milton: "Make message 1 more casual" or "Add email on day 4"
      </div>
    </div>
  );
}

function ReportsCanvas({ onClose, setChatMessages, setChatTyping }) {
  const [viewMode, setViewMode] = useState("mobile"); // mobile | desktop
  const [chatStep, setChatStep] = useState(0); // 0: client, 1: timeframe, 2: generating, 3: done
  const [selectedClient, setSelectedClient] = useState(null);
  const [timeframe, setTimeframe] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [draggedWidget, setDraggedWidget] = useState(null);
  const [dragOverWidget, setDragOverWidget] = useState(null);
  const [showAddWidget, setShowAddWidget] = useState(false);
  
  const GREEN = "#5CDB95";
  
  const clients = [
    { name: "Sarah Chen", initials: "SC", week: 6, phase: "Fat Loss", score: 87 },
    { name: "Marcus Johnson", initials: "MJ", week: 8, phase: "Muscle Gain", score: 92 },
    { name: "Emily Rodriguez", initials: "ER", week: 4, phase: "Metabolic Health", score: 78 }
  ];
  
  const timeframes = [
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "quarter", label: "This Quarter" }
  ];
  
  const availableWidgets = [
    { id: "consistencyScore", type: "score", label: "Consistency Score", locked: true },
    { id: "transformation", type: "chart", label: "Transformation Chart" },
    { id: "goalTrajectory", type: "trajectory", label: "Goal Trajectory" },
    { id: "rule30", type: "rings", label: "Rule of 30" },
    { id: "dataCards", type: "cards", label: "Weekly Metrics" },
    { id: "calendar", type: "calendar", label: "Daily Activity" },
    { id: "insight", type: "insight", label: "Milton Insight" },
    { id: "nutrition", type: "nutrition", label: "Nutrition Breakdown" },
    { id: "coachNotes", type: "text", label: "Coach Notes" }
  ];
  
  // Handler refs
  const handleClientSelectRef = useRef(null);
  const handleTimeframeSelectRef = useRef(null);
  
  const handleClientSelect = (clientName) => {
    const client = clients.find(c => c.name === clientName);
    setSelectedClient(client);
    setChatMessages(prev => prev.map(m => m.options ? { ...m, answered: true } : m));
    setChatMessages(prev => [...prev, { type: "user", text: clientName }]);
    setChatTyping(true);
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        type: "ai",
        text: `Great! What time period should this report cover for ${client?.name?.split(' ')[0]}?`,
        options: timeframes.map(t => t.label),
        onSelect: (val) => handleTimeframeSelectRef.current?.(val)
      }]);
      setChatTyping(false);
      setChatStep(1);
    }, 500);
  };
  
  const handleTimeframeSelect = (tfLabel) => {
    const tf = timeframes.find(t => t.label === tfLabel)?.id || "week";
    setTimeframe(tf);
    setChatMessages(prev => prev.map(m => m.options ? { ...m, answered: true } : m));
    setChatMessages(prev => [...prev, { type: "user", text: tfLabel }]);
    setChatTyping(true);
    setChatStep(2);
    
    // Generate report
    setTimeout(() => {
      const defaultWidgets = [
        { id: "consistencyScore", order: 0 },
        { id: "transformation", order: 1 },
        { id: "goalTrajectory", order: 2 },
        { id: "rule30", order: 3 },
        { id: "dataCards", order: 4 },
        { id: "calendar", order: 5 },
        { id: "insight", order: 6 }
      ];
      setWidgets(defaultWidgets);
      setChatMessages(prev => [...prev, {
        type: "ai",
        text: `Done! I've created a progress report for ${selectedClient?.name}. Drag sections to reorder, or click + to add more widgets like Macro Breakdown or Workout Stats.`
      }]);
      setChatTyping(false);
      setChatStep(3);
    }, 1500);
  };
  
  handleClientSelectRef.current = handleClientSelect;
  handleTimeframeSelectRef.current = handleTimeframeSelect;
  
  // Initialize chat
  useEffect(() => {
    if (setChatMessages) {
      setChatMessages([{
        type: "ai",
        text: "Let's build a progress report. Which client is this for?",
        options: clients.map(c => c.name),
        onSelect: (val) => handleClientSelectRef.current?.(val)
      }]);
    }
  }, []);
  
  // Drag handlers
  const handleDragStart = (e, widgetId) => {
    if (widgetId === "consistencyScore") return; // Consistency score is locked
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = "move";
  };
  
  const handleDragOver = (e, widgetId) => {
    e.preventDefault();
    if (widgetId !== draggedWidget && widgetId !== "consistencyScore") {
      setDragOverWidget(widgetId);
    }
  };
  
  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedWidget || targetId === "consistencyScore" || draggedWidget === "consistencyScore") return;
    
    const newWidgets = [...widgets];
    const dragIdx = newWidgets.findIndex(w => w.id === draggedWidget);
    const dropIdx = newWidgets.findIndex(w => w.id === targetId);
    
    if (dragIdx !== -1 && dropIdx !== -1) {
      const [removed] = newWidgets.splice(dragIdx, 1);
      newWidgets.splice(dropIdx, 0, removed);
      newWidgets.forEach((w, i) => w.order = i);
      setWidgets(newWidgets);
    }
    
    setDraggedWidget(null);
    setDragOverWidget(null);
  };
  
  const handleDragEnd = () => {
    setDraggedWidget(null);
    setDragOverWidget(null);
  };
  
  const addWidget = (widgetId) => {
    if (widgets.find(w => w.id === widgetId)) return;
    setWidgets(prev => [...prev, { id: widgetId, order: prev.length }]);
    setShowAddWidget(false);
  };
  
  const removeWidget = (widgetId) => {
    if (widgetId === "consistencyScore") return;
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  };
  
  // Widget renderer - matching existing report design
  const renderWidget = (widget) => {
    const config = availableWidgets.find(w => w.id === widget.id);
    if (!config) return null;
    
    const isDragging = draggedWidget === widget.id;
    const isDragOver = dragOverWidget === widget.id;
    const isLocked = widget.id === "consistencyScore";
    const isMobile = viewMode === "mobile";
    
    // Client data for widgets
    const client = selectedClient || {};
    const wData = [165, 164.2, 163.5, 162.8, 162.0, 161.5, 161.0, 160.5];
    const mealsScore = Math.round(((client.mealsLogged || 18) / 21) * 100);
    const exerciseScore = Math.round((client.workoutDays || 4) / 5 * 100);
    const movementScore = Math.round((client.steps || 8000) / 10000 * 100);
    const sleepScore = 78;
    const consistencyScore = client.score || 85;
    const scoreColor = consistencyScore >= 80 ? MINT : consistencyScore >= 60 ? SAGE : "#ef6c3e";
    
    const ovPillars = [
      { key: "exercise", label: "Exercise", days: Math.min(30, (client.workoutDays || 4) * 4 + 2), color: TEAL },
      { key: "steps", label: "Steps", days: Math.min(30, Math.round((client.steps || 8000) / 350)), color: "#3aafa9" },
      { key: "meals", label: "Meals", days: Math.min(30, (client.mealsLogged || 18) + 5), color: "#ef6c3e" },
      { key: "sleep", label: "Sleep", days: Math.min(30, 21), color: "#8e7cc3" },
    ];
    
    const WidgetWrapper = ({ children, gradient }) => (
      <div
        draggable={!isLocked}
        onDragStart={(e) => handleDragStart(e, widget.id)}
        onDragOver={(e) => handleDragOver(e, widget.id)}
        onDrop={(e) => handleDrop(e, widget.id)}
        onDragEnd={handleDragEnd}
        style={{
          background: gradient || WHITE,
          borderRadius: 20,
          border: `2px solid ${isDragOver ? GREEN : BORDER}`,
          padding: isMobile ? 18 : 24,
          opacity: isDragging ? 0.5 : 1,
          transform: isDragOver ? "scale(1.02)" : "scale(1)",
          transition: "all 0.15s ease",
          cursor: isLocked ? "default" : "grab",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          position: "relative"
        }}
      >
        {!isLocked && (
          <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }}>
            <div style={{ color: TEXT_SEC, cursor: "grab", padding: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="6" r="2"/><circle cx="15" cy="6" r="2"/>
                <circle cx="9" cy="12" r="2"/><circle cx="15" cy="12" r="2"/>
                <circle cx="9" cy="18" r="2"/><circle cx="15" cy="18" r="2"/>
              </svg>
            </div>
            <div onClick={() => removeWidget(widget.id)} style={{ color: TEXT_SEC, cursor: "pointer", opacity: 0.5, padding: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
          </div>
        )}
        {children}
      </div>
    );
    
    // Consistency Score Widget (matching existing design)
    if (widget.id === "consistencyScore") {
      const sz = 160, r = sz / 2 - 12, circ = 2 * Math.PI * r;
      const offset = circ * (1 - consistencyScore / 100);
      const statusLabel = consistencyScore >= 85 ? "Exceptional Progress" : consistencyScore >= 70 ? "Strong Momentum" : consistencyScore >= 55 ? "Building Momentum" : "Getting Started";
      const statusDesc = consistencyScore >= 70 
        ? "You're crushing it! This score reflects daily commitment across meals, exercise, movement, and sleep."
        : "Slow & steady wins the race. This score reflects daily commitment across meals, exercise, movement, and sleep.";
      const pillars = [
        { label: "Meals", value: mealsScore, weight: 40 },
        { label: "Exercise", value: exerciseScore, weight: 25 },
        { label: "Movement", value: movementScore, weight: 20 },
        { label: "Sleep", value: sleepScore, weight: 15 },
      ];
      
      return (
        <WidgetWrapper key={widget.id} gradient="linear-gradient(145deg, #f8fcfa, #f0f9f5, #f5faf8)">
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              {client.name?.toUpperCase() || "CLIENT"}'S CONSISTENCY SCORE
            </div>
          </div>
          
          {/* Large Score Ring */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
            <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
              <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="#e0ebe8" strokeWidth="10"/>
              <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={scoreColor} strokeWidth="10"
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round" transform={`rotate(-90 ${sz/2} ${sz/2})`}
                style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
              />
              <text x={sz/2} y={sz/2 - 6} textAnchor="middle" dominantBaseline="central"
                style={{ fontSize: 48, fontWeight: 300, fill: TEXT }}>{consistencyScore}</text>
              <text x={sz/2} y={sz/2 + 24} textAnchor="middle" dominantBaseline="central"
                style={{ fontSize: 11, fontWeight: 600, fill: TEXT_SEC, letterSpacing: "0.08em" }}>OUT OF 100</text>
            </svg>
          </div>
          
          {/* Status Label & Description */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: scoreColor, marginBottom: 8 }}>{statusLabel}</div>
            <div style={{ fontSize: 13, color: TEXT_SEC, lineHeight: 1.5, maxWidth: 320, margin: "0 auto" }}>{statusDesc}</div>
          </div>
          
          {/* Four Metric Columns */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, textAlign: "center" }}>
            {pillars.map((p, i) => (
              <div key={i}>
                <div style={{ fontSize: 22, fontWeight: 700, color: TEAL }}>{p.value}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: TEXT_SEC, marginTop: 2 }}>{p.label}</div>
                <div style={{ fontSize: 10, color: TEXT_SEC, opacity: 0.7, marginTop: 1 }}>{p.weight}%</div>
              </div>
            ))}
          </div>
        </WidgetWrapper>
      );
    }
    
    // Transformation Widget (dual-line chart)
    if (widget.id === "transformation") {
      const startW = 165, currW = 160.5;
      const w1c = Math.max(15, consistencyScore - 32);
      const consistencyData = [w1c, w1c + 12, w1c + 22, consistencyScore];
      const goalData = [startW, startW - 1.2, startW - 2.5, currW];
      const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
      const cw = 320, ch = 160, padL = 36, padR = 36, padT = 14, padB = 28;
      const plotW = cw - padL - padR, plotH = ch - padT - padB;
      const cMin = 0, cMax = 100;
      const toYc = (v) => padT + (1 - (v - cMin) / (cMax - cMin)) * plotH;
      const toX = (i) => padL + (i / (weeks.length - 1)) * plotW;
      const gVals = goalData, gMin = Math.min(...gVals) - 3, gMax = Math.max(...gVals) + 3;
      const toYg = (v) => padT + (1 - (v - gMin) / (gMax - gMin)) * plotH;
      const smooth = (pts) => { let d = `M ${pts[0].x},${pts[0].y}`; for (let i = 0; i < pts.length - 1; i++) { const cp = (pts[i+1].x - pts[i].x) / 2.5; d += ` C ${pts[i].x+cp},${pts[i].y} ${pts[i+1].x-cp},${pts[i+1].y} ${pts[i+1].x},${pts[i+1].y}`; } return d; };
      const cPts = consistencyData.map((v, i) => ({ x: toX(i), y: toYc(v) }));
      const gPts = goalData.map((v, i) => ({ x: toX(i), y: toYg(v) }));
      const cPath = smooth(cPts), gPath = smooth(gPts);
      const cArea = `${cPath} L ${cPts[cPts.length-1].x},${padT + plotH} L ${cPts[0].x},${padT + plotH} Z`;
      const cLast = cPts[cPts.length - 1], gLast = gPts[gPts.length - 1];
      const totalChange = `${(startW - currW).toFixed(1)} lbs lost`;
      const scoreChange = consistencyScore - w1c;
      
      return (
        <WidgetWrapper key={widget.id} gradient="linear-gradient(145deg, #f0f9f5, #eaf6f2, #f5faf8)">
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{client.name?.split(" ")[0] || "Client"}'s Transformation</div>
            <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2 }}>Consistency drives results — 4 weeks of progress</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <div style={{ padding: "4px 10px", borderRadius: 16, background: `${TEAL}12`, fontSize: 11, fontWeight: 700, color: TEAL }}>+{scoreChange} pts</div>
              <div style={{ padding: "4px 10px", borderRadius: 16, background: `${ALERT_GREEN}15`, fontSize: 11, fontWeight: 700, color: ALERT_GREEN }}>{totalChange}</div>
            </div>
          </div>
          <div style={{ borderRadius: 14, background: WHITE, border: `1px solid ${BORDER}`, padding: "10px 6px" }}>
            <svg width="100%" height={ch} viewBox={`0 0 ${cw} ${ch}`} preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
              <defs>
                <linearGradient id="repAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TEAL} stopOpacity="0.12"/>
                  <stop offset="100%" stopColor={TEAL} stopOpacity="0.01"/>
                </linearGradient>
              </defs>
              {[0, 25, 50, 75, 100].map((v, i) => (
                <line key={i} x1={padL} y1={toYc(v)} x2={cw - padR} y2={toYc(v)} stroke={BORDER} strokeWidth="0.7" opacity="0.5"/>
              ))}
              {weeks.map((w, i) => (
                <text key={i} x={toX(i)} y={ch - 6} textAnchor="middle" fill={TEXT_SEC} fontSize="9" fontWeight="600">{`W${i+1}`}</text>
              ))}
              <path d={cArea} fill="url(#repAreaGrad)" />
              <path d={cPath} fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" />
              <path d={gPath} fill="none" stroke={ALERT_GREEN} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6,4" />
              {cPts.map((p, i) => (
                <circle key={`c${i}`} cx={p.x} cy={p.y} r={i === cPts.length - 1 ? 5 : 3.5} fill={WHITE} stroke={TEAL} strokeWidth="2"/>
              ))}
              {gPts.map((p, i) => (
                <circle key={`g${i}`} cx={p.x} cy={p.y} r={i === gPts.length - 1 ? 5 : 3.5} fill={WHITE} stroke={ALERT_GREEN} strokeWidth="2"/>
              ))}
              <g><rect x={cLast.x - 16} y={cLast.y - 22} width="32" height="16" rx="8" fill={TEAL}/><text x={cLast.x} y={cLast.y - 11.5} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">{consistencyScore}</text></g>
              <g><rect x={gLast.x - 22} y={gLast.y + 8} width="44" height="16" rx="8" fill={ALERT_GREEN}/><text x={gLast.x} y={gLast.y + 18.5} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">{currW}</text></g>
            </svg>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 16, height: 3, borderRadius: 2, background: TEAL }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: TEXT_SEC }}>Consistency</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 16, height: 0, borderTop: `2.5px dashed ${ALERT_GREEN}` }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: TEXT_SEC }}>Weight</span>
            </div>
          </div>
        </WidgetWrapper>
      );
    }
    
    // Rule of 30 Widget
    if (widget.id === "rule30") {
      return (
        <WidgetWrapper key={widget.id} gradient="linear-gradient(145deg, #faf9f7, #f5f8f4, #f8faf7)">
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>Rule of 30</div>
            <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 2 }}>Every 30 days you unlock a new learning about yourself</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            {ovPillars.map((p, pIdx) => {
              const sz = 70, r = 26, circ = 2 * Math.PI * r;
              const pct = p.days / 30;
              const off = circ * (1 - pct);
              return (
                <div key={pIdx} style={{ textAlign: "center", padding: 16, borderRadius: 16, background: WHITE, border: `1px solid ${BORDER}` }}>
                  <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ display: "block", margin: "0 auto 8px" }}>
                    <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="#e8f0ee" strokeWidth="6"/>
                    <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={p.color} strokeWidth="6"
                      strokeDasharray={circ} strokeDashoffset={off}
                      strokeLinecap="round" transform={`rotate(-90 ${sz/2} ${sz/2})`}
                      style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
                    />
                    <text x={sz/2} y={sz/2 + 1} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 15, fontWeight: 800, fill: TEXT }}>{p.days}</text>
                  </svg>
                  <div style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.label}</div>
                  <div style={{ fontSize: 10, color: TEXT_SEC, marginTop: 2 }}>{p.days} / 30 days</div>
                </div>
              );
            })}
          </div>
        </WidgetWrapper>
      );
    }
    
    // Data Cards Widget
    if (widget.id === "dataCards") {
      const weightChange = client.assessment && client.current ? (client.current.bodyweight - client.assessment.bodyweight).toFixed(1) : "-2.5";
      const cards = [
        { label: "Sessions This Week", value: client.sessionsThisWeek || 2, unit: `/${client.sessionsPerWeek || 3}`, color: TEAL },
        { label: "Total Sessions", value: client.totalSessions || 12, unit: "", color: "#3aafa9" },
        { label: "Session Streak", value: client.streak?.current || 6, unit: "", color: MINT },
        { label: "Weight Change", value: weightChange, unit: " lbs", color: parseFloat(weightChange) < 0 ? ALERT_GREEN : "#3aafa9" }
      ];
      return (
        <WidgetWrapper key={widget.id}>
          <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Training Metrics</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {cards.map((c, i) => (
              <div key={i} style={{ padding: 16, borderRadius: 14, background: `${c.color}08`, border: `1px solid ${c.color}20`, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: c.color }}>{c.value}{c.unit}</div>
                <div style={{ fontSize: 11, color: TEXT_SEC, marginTop: 4 }}>{c.label}</div>
              </div>
            ))}
          </div>
        </WidgetWrapper>
      );
    }
    
    // Calendar Widget - Sessions Calendar
    if (widget.id === "calendar") {
      const dayNames = ["M","T","W","T","F","S","S"];
      // Generate session data based on client's sessions
      const sessions = client.sessions || [];
      const calDays = Array.from({ length: 28 }).map((_, i) => {
        const dayOfWeek = i % 7;
        // Typically training days are Mon/Wed/Fri or Tue/Thu/Sat
        const isTrainingDay = dayOfWeek === 0 || dayOfWeek === 2 || dayOfWeek === 4;
        const rand = Math.random();
        return { 
          completed: isTrainingDay && rand > 0.25,
          rest: !isTrainingDay,
          intensity: rand > 0.6 ? "high" : rand > 0.3 ? "medium" : "light"
        };
      });
      return (
        <WidgetWrapper key={widget.id}>
          <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Training Calendar</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {dayNames.map((d, i) => (
              <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, color: TEXT_SEC, marginBottom: 4 }}>{d}</div>
            ))}
            {calDays.map((day, i) => (
              <div key={i} style={{
                aspectRatio: "1", borderRadius: 8,
                background: day.rest ? "#f8f9fa" : day.completed ? 
                  (day.intensity === "high" ? TEAL : day.intensity === "medium" ? `${TEAL}90` : `${TEAL}50`) : "#f0f4f3",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: day.rest ? `1px dashed ${BORDER}` : "none"
              }}>
                {day.completed && day.intensity === "high" && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 12, justifyContent: "center" }}>
            {[{c: TEAL, l: "High"}, {c: `${TEAL}90`, l: "Med"}, {c: `${TEAL}50`, l: "Light"}, {c: "#f8f9fa", l: "Rest"}].map((leg, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: leg.c, border: leg.l === "Rest" ? `1px dashed ${BORDER}` : "none" }}/>
                <span style={{ fontSize: 10, color: TEXT_SEC }}>{leg.l}</span>
              </div>
            ))}
          </div>
        </WidgetWrapper>
      );
    }
    
    // Milton Insight Widget
    if (widget.id === "insight") {
      const firstName = client.name?.split(" ")[0] || "This client";
      const insightText = client.insight || `${firstName} has shown strong consistency with ${client.totalSessions || 12} sessions completed. Focus on progressive overload for continued strength gains.`;
      return (
        <WidgetWrapper key={widget.id} gradient="linear-gradient(145deg, #eef9f6, #e8f5f0)">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${TEAL}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Milton's Training Insight</div>
              <div style={{ fontSize: 14, color: TEXT, lineHeight: 1.6 }}>{insightText}</div>
              {client.coachAngle && (
                <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 8, fontStyle: "italic" }}>
                  Coach action: {client.coachAngle}
                </div>
              )}
            </div>
          </div>
        </WidgetWrapper>
      );
    }
    
    // Goal Trajectory Widget
    if (widget.id === "goalTrajectory") {
      const isFatLoss = client.phase === "Fat Loss" || client.phase === "Metabolic Health";
      const startVal = 165;
      const currentVal = 160.5;
      const goalVal = isFatLoss ? 155 : 140;
      const weeksTotal = 12, weeksCurrent = 4;
      const cw = 320, ch = 140, padL = 36, padR = 16, padT = 14, padB = 26;
      const plotW = cw - padL - padR, plotH = ch - padT - padB;
      const valMin = goalVal - 2, valMax = startVal + 2, valRange = valMax - valMin;
      const toY = (v) => padT + (1 - (v - valMin) / valRange) * plotH;
      const toX = (w) => padL + (w / weeksTotal) * plotW;
      const actualPts = []; for (let w = 0; w <= weeksCurrent; w++) { const t = w / weeksCurrent; actualPts.push({ x: toX(w), y: toY(startVal + (currentVal - startVal) * t) }); }
      const projPts = []; for (let w = weeksCurrent; w <= weeksTotal; w++) { const t = (w - weeksCurrent) / (weeksTotal - weeksCurrent); projPts.push({ x: toX(w), y: toY(currentVal + (goalVal - currentVal) * t) }); }
      const smooth = (pts) => { let d = `M ${pts[0].x},${pts[0].y}`; for (let i = 0; i < pts.length - 1; i++) { const cp = (pts[i+1].x - pts[i].x) / 2.5; d += ` C ${pts[i].x+cp},${pts[i].y} ${pts[i+1].x-cp},${pts[i+1].y} ${pts[i+1].x},${pts[i+1].y}`; } return d; };
      const actualPath = smooth(actualPts), projPath = smooth(projPts);
      const lastActual = actualPts[actualPts.length - 1];
      const goalY = toY(goalVal), goalX = toX(weeksTotal);
      const actualArea = `${actualPath} L ${lastActual.x},${padT + plotH} L ${actualPts[0].x},${padT + plotH} Z`;
      
      return (
        <WidgetWrapper key={widget.id} gradient="linear-gradient(160deg, #f7fcfb, #eef8f5, #f5faf8)">
          <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>We predict you'll reach</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, marginBottom: 2 }}>
            <span style={{ color: TEAL }}>{goalVal} lbs</span> by <span style={{ color: TEAL }}>Week {weeksTotal}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <div style={{ padding: "3px 8px", borderRadius: 10, background: `${ALERT_GREEN}18`, fontSize: 11, fontWeight: 700, color: ALERT_GREEN }}>On Track</div>
            <span style={{ fontSize: 12, color: TEXT_SEC }}>8 weeks away</span>
          </div>
          <div style={{ borderRadius: 12, background: WHITE, border: `1px solid ${BORDER}`, padding: "8px 4px" }}>
            <svg width="100%" height={ch} viewBox={`0 0 ${cw} ${ch}`} preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
              <defs>
                <linearGradient id="trajAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TEAL} stopOpacity="0.15"/>
                  <stop offset="100%" stopColor={TEAL} stopOpacity="0.02"/>
                </linearGradient>
              </defs>
              {/* Goal line */}
              <line x1={padL} y1={goalY} x2={cw - padR} y2={goalY} stroke={ALERT_GREEN} strokeWidth="1.5" strokeDasharray="4,4" opacity="0.7"/>
              <text x={cw - padR - 2} y={goalY - 6} textAnchor="end" fill={ALERT_GREEN} fontSize="9" fontWeight="700">Goal: {goalVal}</text>
              {/* Actual area */}
              <path d={actualArea} fill="url(#trajAreaGrad)"/>
              {/* Actual line */}
              <path d={actualPath} fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round"/>
              {/* Projected line */}
              <path d={projPath} fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeDasharray="6,4" opacity="0.6"/>
              {/* Current point */}
              <circle cx={lastActual.x} cy={lastActual.y} r="6" fill={WHITE} stroke={TEAL} strokeWidth="2.5"/>
              <rect x={lastActual.x - 18} y={lastActual.y - 22} width="36" height="16" rx="8" fill={TEAL}/>
              <text x={lastActual.x} y={lastActual.y - 11} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">{currentVal}</text>
              {/* Goal point */}
              <circle cx={goalX} cy={goalY} r="5" fill={ALERT_GREEN} opacity="0.3"/>
              <circle cx={goalX} cy={goalY} r="3" fill={ALERT_GREEN}/>
              {/* Week labels */}
              {[0, 4, 8, 12].map(w => (
                <text key={w} x={toX(w)} y={ch - 6} textAnchor="middle" fill={TEXT_SEC} fontSize="9" fontWeight="600">W{w || 1}</text>
              ))}
            </svg>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 14, height: 3, borderRadius: 2, background: TEAL }}/>
              <span style={{ fontSize: 10, fontWeight: 600, color: TEXT_SEC }}>Actual</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 14, height: 0, borderTop: `2px dashed ${TEAL}`, opacity: 0.6 }}/>
              <span style={{ fontSize: 10, fontWeight: 600, color: TEXT_SEC }}>Projected</span>
            </div>
          </div>
        </WidgetWrapper>
      );
    }
    
    // Coach Notes Widget
    if (widget.id === "coachNotes") {
      return (
        <WidgetWrapper key={widget.id}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f0e8ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e7cc3" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Coach Notes</div>
          </div>
          <div style={{ fontSize: 14, color: TEXT_SEC, lineHeight: 1.65, padding: "14px 16px", borderRadius: 12, background: "#f8faf9", border: `1px solid ${BORDER}` }}>
            Great week overall for {client.name?.split(" ")[0] || "this client"}. Consistency score trending up and weight is moving in the right direction. Main opportunity is protein intake — let's discuss meal prep strategies in our next session.
          </div>
        </WidgetWrapper>
      );
    }
    
    // Nutrition Breakdown Widget
    if (widget.id === "nutrition") {
      const macros = [
        { label: "Protein", value: client.proteinAvg || 95, target: client.proteinTarget || 120, unit: "g", color: TEAL },
        { label: "Carbs", value: 145, target: 180, unit: "g", color: "#3aafa9" },
        { label: "Fats", value: 52, target: 60, unit: "g", color: "#ef6c3e" },
      ];
      return (
        <WidgetWrapper key={widget.id} gradient="linear-gradient(145deg, #fdf8f4, #faf5ee, #fdf9f5)">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>Nutrition Breakdown</div>
              <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2 }}>Average daily intake — past 7 days</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {macros.map((m, i) => {
              const pct = Math.min(100, Math.round((m.value / m.target) * 100));
              const sz = 60, r = 22, circ = 2 * Math.PI * r, off = circ * (1 - pct / 100);
              return (
                <div key={i} style={{ padding: 12, borderRadius: 14, background: WHITE, border: `1px solid ${BORDER}`, textAlign: "center" }}>
                  <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ display: "block", margin: "0 auto 8px" }}>
                    <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="#e8f0ee" strokeWidth="5"/>
                    <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={m.color} strokeWidth="5"
                      strokeDasharray={circ} strokeDashoffset={off}
                      strokeLinecap="round" transform={`rotate(-90 ${sz/2} ${sz/2})`}
                    />
                    <text x={sz/2} y={sz/2 + 1} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 12, fontWeight: 800, fill: TEXT }}>{pct}%</text>
                  </svg>
                  <div style={{ fontSize: 16, fontWeight: 800, color: m.color }}>{m.value}{m.unit}</div>
                  <div style={{ fontSize: 10, color: TEXT_SEC, marginTop: 2 }}>{m.label}</div>
                </div>
              );
            })}
          </div>
        </WidgetWrapper>
      );
    }
    
    return null;
  };
  
  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);
  const addableWidgets = availableWidgets.filter(w => !widgets.find(ww => ww.id === w.id) && w.id !== "consistencyScore");
  
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#f8faf9", position: "relative" }}>
      {/* Close button */}
      <div
        onClick={onClose}
        style={{
          position: "absolute", top: 16, right: 16, zIndex: 20,
          width: 32, height: 32, borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: TEXT_SEC, opacity: 0.6,
          background: "rgba(255,255,255,0.9)", border: `1px solid ${BORDER}`,
          transition: "all 0.15s ease"
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = TEXT; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = 0.6; e.currentTarget.style.color = TEXT_SEC; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </div>
      
      {/* Header */}
      <div style={{ padding: "16px 56px 16px 24px", borderBottom: `1px solid ${BORDER}`, background: WHITE, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: TEXT, margin: 0 }}>Progress Report</h2>
          <p style={{ fontSize: 12, color: TEXT_SEC, margin: "4px 0 0" }}>
            {chatStep < 3 ? "Building your report..." : `Report for ${selectedClient?.name}`}
          </p>
        </div>
        
        {/* View toggle */}
        {chatStep === 3 && (
          <div style={{ display: "flex", background: "#f0f2f1", borderRadius: 8, padding: 3 }}>
            {["mobile", "desktop"].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: "6px 12px", borderRadius: 6, border: "none",
                  background: viewMode === mode ? WHITE : "transparent",
                  color: viewMode === mode ? TEXT : TEXT_SEC,
                  fontSize: 12, fontWeight: 500, cursor: "pointer",
                  boxShadow: viewMode === mode ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.15s ease", textTransform: "capitalize"
                }}
              >
                {mode === "mobile" ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                      <line x1="12" y1="18" x2="12" y2="18"/>
                    </svg>
                    Mobile
                  </span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                    Desktop
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
        
        {/* Add widget button */}
        {chatStep === 3 && addableWidgets.length > 0 && (
          <button
            onClick={() => setShowAddWidget(true)}
            style={{
              width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`,
              background: WHITE, color: TEXT_SEC, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s ease"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        )}
      </div>
      
      {/* Report preview area */}
      <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", justifyContent: "center" }}>
        {chatStep < 3 ? (
          /* Building state */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20, background: `${GREEN}10`,
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: TEXT, marginBottom: 8 }}>
              {chatStep === 0 && "Let's build your report"}
              {chatStep === 1 && "Setting up..."}
              {chatStep === 2 && "Generating report..."}
            </div>
            <div style={{ fontSize: 14, color: TEXT_SEC }}>
              Answer the questions to create a progress report
            </div>
            {/* Progress dots */}
            <div style={{ display: "flex", gap: 8, marginTop: 32, height: 20, alignItems: "center" }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: i <= chatStep ? GREEN : BORDER,
                  transition: "background 0.3s ease",
                  animation: i <= chatStep && chatStep < 3 ? `dotBounce 1.2s ease-in-out ${i * 0.15}s infinite` : "none"
                }} />
              ))}
            </div>
          </div>
        ) : (
          /* Report preview - scaled by view mode */
          <div style={{
            width: viewMode === "mobile" ? 375 : "100%",
            maxWidth: viewMode === "desktop" ? 800 : 375,
            maxHeight: "100%",
            background: WHITE,
            borderRadius: 16,
            overflowY: "auto",
            overflowX: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: `1px solid ${BORDER}`,
            transition: "width 0.3s ease, max-width 0.3s ease"
          }}>
              <div style={{ padding: viewMode === "mobile" ? 16 : 24, display: "flex", flexDirection: "column", gap: 12 }}>
              {(() => {
                const result = [];
                let i = 0;
                while (i < sortedWidgets.length) {
                  const widget = sortedWidgets[i];
                  // Group transformation and goalTrajectory side by side on desktop
                  if (viewMode === "desktop" && widget.id === "transformation" && sortedWidgets[i + 1]?.id === "goalTrajectory") {
                    result.push(
                      <div key="charts-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {renderWidget(widget)}
                        {renderWidget(sortedWidgets[i + 1])}
                      </div>
                    );
                    i += 2;
                  } else {
                    result.push(renderWidget(widget));
                    i++;
                  }
                }
                return result;
              })()}
              
              {/* Add section button */}
              {addableWidgets.length > 0 && (
                <button
                  onClick={() => setShowAddWidget(true)}
                  style={{
                    padding: 16, borderRadius: 12, border: `2px dashed ${BORDER}`,
                    background: "transparent", color: TEXT_SEC, cursor: "pointer",
                    fontSize: 13, fontWeight: 500, transition: "all 0.15s ease",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add Section
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Add widget modal */}
      {showAddWidget && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 30
        }} onClick={() => setShowAddWidget(false)}>
          <div style={{
            background: WHITE, borderRadius: 16, padding: 20, width: 300,
            maxHeight: "70%", overflowY: "auto"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 16 }}>Add Section</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {addableWidgets.map(w => (
                <button
                  key={w.id}
                  onClick={() => addWidget(w.id)}
                  style={{
                    padding: "12px 14px", borderRadius: 10, border: `1px solid ${BORDER}`,
                    background: WHITE, textAlign: "left", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 12,
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: `${TEAL}15`,
                    display: "flex", alignItems: "center", justifyContent: "center", color: TEAL
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {w.type === "chart" && <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>}
                      {w.type === "trajectory" && <><path d="M22 12h-4l-3 9L9 3l-3 9H2"/><circle cx="18" cy="6" r="3"/></>}
                      {w.type === "rings" && <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>}
                      {w.type === "cards" && <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>}
                      {w.type === "insight" && <><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></>}
                      {w.type === "nutrition" && <><path d="M12 3Q13 2 14.5 3 Q13 4 12 5.5"/><path d="M12 5.5 Q7 5 5 9 Q3 13 5 17 Q7 21 11.5 21 Q12 20 12.5 21 Q17 21 19 17 Q21 13 19 9 Q17 5 12 5.5Z"/></>}
                      {w.type === "text" && <><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></>}
                      {w.type === "calendar" && <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}
                    </svg>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>{w.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
   ═════════════════════════════════════════════ */
export default function MiltonDashboard() {
  const isMobile = useIsMobile();
  const [clients, setClients] = useState([...initialClients]);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([...chatSeedMessages]);
  const [chatTyping, setChatTyping] = useState(false);
  const [hoveredClient, setHoveredClient] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientFilter, setClientFilter] = useState(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMiltonBrain, setShowMiltonBrain] = useState(false);
  const [brainDocuments, setBrainDocuments] = useState([
    { id: 1, name: "Training Philosophy.pdf", size: "2.4 MB", date: "2026-03-15", status: "processed" },
    { id: 2, name: "Nutrition Guidelines.docx", size: "1.1 MB", date: "2026-03-10", status: "processed" },
  ]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [mainReportBlocks, setMainReportBlocks] = useState(null);
  const [mainCustomizeMode, setMainCustomizeMode] = useState(false);
  const chatEndRef = useRef(null);
  const [animatedKPIs, setAnimatedKPIs] = useState([false, false, false, false]);

  // Canvas state
  const [canvasMode, setCanvasMode] = useState(false);
  const [canvasType, setCanvasType] = useState(null); // 'mealPlan' | 'workout' | 'messageSequence' | 'report'
  const [canvasData, setCanvasData] = useState(null);
  const [canvasClient, setCanvasClient] = useState(null);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [canvasHistoryIndex, setCanvasHistoryIndex] = useState(-1);
  const [canvasSelectedDay, setCanvasSelectedDay] = useState(null); // For calendar day zoom

  const clientNames = clients.map(c => c.name);

  const handleChatSend = async (text) => {
    const newUserMessage = { type: "user", text };
    setChatMessages(prev => [...prev, newUserMessage]);
    setChatTyping(true);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    const delay = 300;

    // Report customization commands (keep local for instant response)
    const low = text.toLowerCase();
    const reportCmd = (() => {
      const blocks = mainReportBlocks || ["top3", "rule30", "dataCards", "calendar", "insight"];
      const blockMap = {
        "nutrition": { id: "nutrition", label: "Nutrition Breakdown" },
        "focus": { id: "focus", label: "Focus Areas" },
        "coach notes": { id: "coachNotes", label: "Coach Notes" },
        "coach note": { id: "coachNotes", label: "Coach Notes" },
        "notes": { id: "coachNotes", label: "Coach Notes" },
        "rule of 30": { id: "rule30", label: "Rule of 30" },
        "rule30": { id: "rule30", label: "Rule of 30" },
        "calendar": { id: "calendar", label: "Daily Activity" },
        "daily activity": { id: "calendar", label: "Daily Activity" },
        "activity": { id: "calendar", label: "Daily Activity" },
        "data cards": { id: "dataCards", label: "Data Cards" },
        "score": { id: "top3", label: "Score & Charts" },
        "charts": { id: "top3", label: "Score & Charts" },
        "transformation": { id: "top3", label: "Score & Charts" },
        "insight": { id: "insight", label: "Milton Insight" },
      };
      if (low.includes("add") || low.includes("include") || low.includes("show")) {
        for (const [key, val] of Object.entries(blockMap)) {
          if (low.includes(key) && !blocks.includes(val.id)) {
            return { action: "add", block: val, newBlocks: [...blocks, val.id] };
          }
        }
      }
      if (low.includes("remove") || low.includes("hide") || low.includes("delete") || low.includes("take out")) {
        for (const [key, val] of Object.entries(blockMap)) {
          if (low.includes(key) && blocks.includes(val.id)) {
            return { action: "remove", block: val, newBlocks: blocks.filter(b => b !== val.id) };
          }
        }
      }
      if (low.includes("move") && low.includes("top")) {
        for (const [key, val] of Object.entries(blockMap)) {
          if (low.includes(key) && blocks.includes(val.id)) {
            const rest = blocks.filter(b => b !== val.id);
            return { action: "move", block: val, newBlocks: [val.id, ...rest] };
          }
        }
      }
      if (low.includes("move") && low.includes("bottom")) {
        for (const [key, val] of Object.entries(blockMap)) {
          if (low.includes(key) && blocks.includes(val.id)) {
            const rest = blocks.filter(b => b !== val.id);
            return { action: "move", block: val, newBlocks: [...rest, val.id] };
          }
        }
      }
      return null;
    })();

    if (reportCmd) {
      setTimeout(() => {
        setMainReportBlocks(reportCmd.newBlocks);
        const msgs = {
          add: { title: `Added: ${reportCmd.block.label}`, text: `I've added the ${reportCmd.block.label} section to the report. You can see it in the overview now. Want me to adjust anything about it?` },
          remove: { title: `Removed: ${reportCmd.block.label}`, text: `Done — I've removed the ${reportCmd.block.label} section. You can always add it back by telling me or clicking the + button in customize mode.` },
          move: { title: `Moved: ${reportCmd.block.label}`, text: `I've moved ${reportCmd.block.label} to the ${low.includes("top") ? "top" : "bottom"} of the report. Let me know if you want to rearrange anything else.` },
        };
        setChatMessages(prev => [...prev, { type: "ai", ...(msgs[reportCmd.action] || msgs.add) }]);
        setChatTyping(false);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }, delay);
      return;
    }

    // Canvas intent detection - create meal plans, workouts, message sequences, reports
    const canvasIntent = (() => {
      // Find which client is mentioned
      let clientMatch = null;
      for (const c of clients) {
        const firstName = c.name.split(" ")[0].toLowerCase();
        if (low.includes(firstName)) {
          clientMatch = c;
          break;
        }
      }
      // Fall back to selected client if no name mentioned
      if (!clientMatch && selectedClient !== null) {
        clientMatch = clients[selectedClient];
      }
      
      if (!clientMatch) return null;
      
      // Meal plan intent
      if (/(create|make|build|generate|design)\s+(a\s+)?(meal\s*plan|nutrition\s*plan|eating\s*plan|diet\s*plan|weekly\s*meals?)/i.test(low)) {
        return { type: "mealPlan", client: clientMatch };
      }
      
      // Workout intent
      if (/(create|make|build|generate|design)\s+(a\s+)?(workout|exercise|training|fitness)\s*(program|plan|routine)?/i.test(low)) {
        return { type: "workout", client: clientMatch };
      }
      
      // Message sequence intent
      if (/(create|make|build|generate|design|draft)\s+(a\s+)?(message|check-?in|follow-?up|outreach|campaign)\s*(sequence|series|plan)?/i.test(low) ||
          /(create|make|build)\s+(a\s+)?(sequence|series)\s*(of\s+)?(messages?|check-?ins?)/i.test(low)) {
        return { type: "messageSequence", client: clientMatch };
      }
      
      // Report intent
      if (/(create|make|build|generate)\s+(a\s+)?(progress\s*)?report/i.test(low) ||
          /(generate|create|build)\s+(a\s+)?summary/i.test(low)) {
        return { type: "report", client: clientMatch };
      }
      
      return null;
    })();

    if (canvasIntent) {
      setTimeout(() => {
        const firstName = canvasIntent.client.name.split(" ")[0];
        let data, responseText;
        
        if (canvasIntent.type === "mealPlan") {
          data = generateMealPlan(canvasIntent.client.name);
          responseText = `**I'm creating a meal plan for ${firstName}!**\n\nI've generated a 7-day meal plan targeting ${data.weeklyTargets.calories} calories and ${data.weeklyTargets.protein}g protein per day.\n\nYou can see the full plan in the canvas on the right. To make changes, just tell me:\n- "Swap Monday's lunch with grilled salmon"\n- "Increase protein on all days"\n- "Add a morning snack"`;
        } else if (canvasIntent.type === "workout") {
          data = generateWorkoutProgram(canvasIntent.client.name);
          responseText = `**I'm creating a workout program for ${firstName}!**\n\nI've designed a strength building program with push/pull/legs split.\n\nYou can see the full program in the canvas. To make changes:\n- "Add more chest exercises on Monday"\n- "Replace deadlifts with trap bar deadlifts"\n- "Make Wednesday a rest day"`;
        } else if (canvasIntent.type === "messageSequence") {
          data = generateMessageSequence(canvasIntent.client.name);
          responseText = `**I'm creating a message sequence for ${firstName}!**\n\nI've drafted a 4-message check-in series over 7 days, mixing SMS and email.\n\nYou can see the full sequence in the canvas. To make changes:\n- "Make the first message more casual"\n- "Add an email on day 4"\n- "Change the subject line to something catchier"`;
        } else if (canvasIntent.type === "report") {
          data = generateProgressReport(canvasIntent.client.name, canvasIntent.client);
          responseText = `**I'm creating a progress report for ${firstName}!**\n\nI've generated a comprehensive weekly report with key metrics and recommendations.\n\nYou can see the full report in the canvas. To make changes:\n- "Add a nutrition breakdown section"\n- "Move recommendations to the top"\n- "Make the summary more encouraging"`;
        }
        
        setCanvasType(canvasIntent.type);
        setCanvasData(data);
        setCanvasClient(canvasIntent.client.name);
        setCanvasHistory([data]);
        setCanvasHistoryIndex(0);
        setCanvasMode(true);
        
        setChatMessages(prev => [...prev, { type: "ai", text: responseText }]);
        setChatTyping(false);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }, delay + 500);
      return;
    }

    // Canvas edit commands (when canvas is open)
    if (canvasMode && canvasData) {
      const canvasEditCmd = (() => {
        if (canvasType === "mealPlan") {
          // Swap meal: "swap Monday's lunch with grilled salmon"
          const swapMatch = low.match(/swap\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:'s)?\s+(breakfast|lunch|dinner|snack)\s+(?:with|to|for)\s+(.+)/i);
          if (swapMatch) {
            const [, day, mealType, newMealName] = swapMatch;
            return { action: "swapMeal", day, mealType, newMealName };
          }
          // Increase protein
          if (/increase\s+protein/i.test(low)) {
            return { action: "increaseProtein" };
          }
          // Add snack
          if (/add\s+(a\s+)?(morning\s+)?snack/i.test(low)) {
            return { action: "addSnack" };
          }
        }
        if (canvasType === "workout") {
          // Add exercises
          if (/add\s+more\s+(\w+)\s+exercises?\s+on\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(low)) {
            const match = low.match(/add\s+more\s+(\w+)\s+exercises?\s+on\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
            return { action: "addExercises", muscle: match[1], day: match[2] };
          }
        }
        if (canvasType === "messageSequence") {
          // Make more casual
          if (/more\s+casual/i.test(low)) {
            return { action: "makeCasual" };
          }
          // Add message
          if (/add\s+(an?\s+)?(email|sms|message)/i.test(low)) {
            const match = low.match(/add\s+(an?\s+)?(email|sms|message)/i);
            return { action: "addMessage", type: match[2] === "sms" ? "sms" : "email" };
          }
        }
        return null;
      })();

      if (canvasEditCmd) {
        setTimeout(() => {
          let newData = JSON.parse(JSON.stringify(canvasData));
          let responseText = "";

          if (canvasEditCmd.action === "swapMeal") {
            const dayIndex = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].indexOf(canvasEditCmd.day.toLowerCase());
            if (dayIndex !== -1 && newData.days?.[dayIndex]) {
              const mealIndex = newData.days[dayIndex].meals.findIndex(m => m.type === canvasEditCmd.mealType.toLowerCase());
              if (mealIndex !== -1) {
                newData.days[dayIndex].meals[mealIndex].name = canvasEditCmd.newMealName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                responseText = `Done! I've swapped ${canvasEditCmd.day}'s ${canvasEditCmd.mealType} with ${canvasEditCmd.newMealName}.`;
              }
            }
          } else if (canvasEditCmd.action === "increaseProtein") {
            newData.days?.forEach(day => {
              day.meals?.forEach(meal => {
                meal.protein = Math.round(meal.protein * 1.2);
                meal.calories = Math.round(meal.calories * 1.05);
              });
            });
            newData.weeklyTargets.protein = Math.round(newData.weeklyTargets.protein * 1.2);
            responseText = "Done! I've increased protein across all meals by about 20%.";
          } else if (canvasEditCmd.action === "addSnack") {
            newData.days?.forEach(day => {
              day.meals.push({ type: "morning snack", name: "Greek Yogurt & Berries", calories: 180, protein: 15, carbs: 20, fat: 5 });
            });
            responseText = "Done! I've added a morning snack (Greek Yogurt & Berries) to each day.";
          } else if (canvasEditCmd.action === "addExercises") {
            const dayIndex = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].indexOf(canvasEditCmd.day.toLowerCase());
            if (dayIndex !== -1 && newData.days?.[dayIndex]) {
              newData.days[dayIndex].exercises.push({ name: `${canvasEditCmd.muscle.charAt(0).toUpperCase() + canvasEditCmd.muscle.slice(1)} Cable Flyes`, sets: 3, reps: "12-15", weight: "25 lbs", rest: "45s" });
              responseText = `Done! I've added ${canvasEditCmd.muscle} exercises to ${canvasEditCmd.day}.`;
            }
          } else if (canvasEditCmd.action === "makeCasual") {
            newData.messages?.forEach(msg => {
              msg.body = msg.body.replace(/Hi /g, "Hey ").replace(/Hello /g, "Hey ").replace(/Best,/g, "Cheers,").replace(/Looking forward/g, "Can't wait");
            });
            responseText = "Done! I've made the messages more casual and friendly.";
          } else if (canvasEditCmd.action === "addMessage") {
            const lastDay = Math.max(...newData.messages.map(m => m.day));
            newData.messages.push({
              day: lastDay + 2,
              type: canvasEditCmd.type,
              subject: canvasEditCmd.type === "email" ? "Quick Check-In" : null,
              body: canvasEditCmd.type === "email" ? `Hey ${canvasClient?.split(" ")[0]},\n\nJust wanted to drop a quick note to see how things are going. Any wins to celebrate this week?\n\nYour Coach` : `Hey ${canvasClient?.split(" ")[0]}! How's this week going? Any wins to celebrate?`,
              status: "draft"
            });
            responseText = `Done! I've added a new ${canvasEditCmd.type} on day ${lastDay + 2}.`;
          }

          if (responseText) {
            // Add to history for undo/redo
            const newHistory = canvasHistory.slice(0, canvasHistoryIndex + 1);
            newHistory.push(newData);
            setCanvasHistory(newHistory);
            setCanvasHistoryIndex(newHistory.length - 1);
            setCanvasData(newData);
          }

          setChatMessages(prev => [...prev, { type: "ai", text: responseText || "I couldn't apply that change. Try being more specific!" }]);
          setChatTyping(false);
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }, delay);
        return;
      }
    }

    // Client data modification commands (goal changes, weight updates, etc.)
    const clientUpdateCmd = (() => {
      // Find which client is mentioned - check explicit names first
      let clientIndex = clients.findIndex(c => low.includes(c.name.toLowerCase().split(" ")[0].toLowerCase()));
      
      // If no name mentioned, check for contextual references (her/his/their) and use selectedClient
      if (clientIndex === -1 && selectedClient !== null) {
        const hasContextualRef = /\b(her|his|their|she|he|this client|the client)\b/i.test(low);
        const hasGoalKeyword = /\b(goal|target|weight|protein|calorie)/i.test(low);
        if (hasContextualRef || hasGoalKeyword) {
          clientIndex = selectedClient;
        }
      }
      
      if (clientIndex === -1) return null;
      const client = clients[clientIndex];
      const firstName = client.name.split(" ")[0];
      
      // Detect goal weight changes - broader patterns
      // Matches: "set her goal to 155", "change goal to 150", "goal to 150 lbs", "let's set the goal to 155"
      const goalMatch = low.match(/(?:let'?s?\s+)?(?:change|set|update|adjust|make)?\s*(?:her|his|their|the)?\s*(?:weight\s+)?goal\s*(?:to|at|weight)?\s*(\d+)\s*(?:lbs?|pounds?)?/i) 
        || low.match(/goal\s*(?:to|at|of|:)?\s*(\d+)\s*(?:lbs?|pounds?)?/i);
      if (goalMatch) {
        const newGoalWeight = parseInt(goalMatch[1]);
        const currentWeight = client.weightData?.[client.weightData.length - 1] || 159;
        const lbsToGo = Math.abs(currentWeight - newGoalWeight);
        return {
          type: "goal",
          clientIndex,
          client,
          firstName,
          newGoalWeight,
          currentWeight,
          lbsToGo,
          updates: {
            goalWeight: newGoalWeight,
            goal: `Lose ${lbsToGo} lbs (${currentWeight} → ${newGoalWeight})`
          }
        };
      }
      
      // Detect protein target changes: "change protein target to 100g", "set protein to 130"
      const proteinMatch = low.match(/(?:change|set|update|adjust)?\s*(?:her|his|their)?\s*protein\s*(?:target|goal)?\s*(?:to)?\s*(\d+)\s*g?/i);
      if (proteinMatch) {
        const newProteinTarget = parseInt(proteinMatch[1]);
        return {
          type: "protein",
          clientIndex,
          client,
          firstName,
          newProteinTarget,
          updates: {
            proteinTarget: newProteinTarget
          }
        };
      }
      
      // Detect calorie target changes
      const calorieMatch = low.match(/(?:change|set|update|adjust)?\s*(?:her|his|their)?\s*calorie[s]?\s*(?:target|goal)?\s*(?:to)?\s*(\d+)/i);
      if (calorieMatch) {
        const newCalorieTarget = parseInt(calorieMatch[1]);
        return {
          type: "calories",
          clientIndex,
          client,
          firstName,
          newCalorieTarget,
          updates: {
            calorieTarget: newCalorieTarget
          }
        };
      }
      
      return null;
    })();

    console.log("[v0] clientUpdateCmd:", clientUpdateCmd, "selectedClient:", selectedClient, "low:", low);
    
    if (clientUpdateCmd) {
      setTimeout(() => {
        // Update the client data
        setClients(prev => {
          const updated = [...prev];
          updated[clientUpdateCmd.clientIndex] = {
            ...updated[clientUpdateCmd.clientIndex],
            ...clientUpdateCmd.updates
          };
          return updated;
        });
        
        // Generate appropriate response
        let responseText = "";
        if (clientUpdateCmd.type === "goal") {
          responseText = `**Done! I've updated ${clientUpdateCmd.firstName}'s goal.**\n\n- **New goal weight:** ${clientUpdateCmd.newGoalWeight} lbs\n- **Current weight:** ${clientUpdateCmd.currentWeight} lbs\n- **To go:** ${clientUpdateCmd.lbsToGo} lbs\n\nThis feels much more achievable. The charts and predictions will now reflect this new target. Want me to draft a message to ${clientUpdateCmd.firstName} about the updated goal?`;
        } else if (clientUpdateCmd.type === "protein") {
          responseText = `**Updated ${clientUpdateCmd.firstName}'s protein target to ${clientUpdateCmd.newProteinTarget}g.**\n\nThe nutrition cards will now show progress against this new target. Should I also adjust their meal plan recommendations?`;
        } else if (clientUpdateCmd.type === "calories") {
          responseText = `**Updated ${clientUpdateCmd.firstName}'s calorie target to ${clientUpdateCmd.newCalorieTarget}.**\n\nThis change is now reflected in their dashboard. Want me to recalculate their macros based on this new target?`;
        }
        
        setChatMessages(prev => [...prev, { type: "ai", text: responseText }]);
        setChatTyping(false);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }, delay + 500); // Slightly longer delay for data updates
      return;
    }

    // Call our backend API which has workout data and tools
    (async () => {
      const startTime = Date.now();
      const MIN_THINKING_TIME = 2000; // Minimum 2 seconds of "thinking"
      
      try {
        const allMessages = [...chatMessages, newUserMessage];
        
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: allMessages,
            clients: clients,
            selectedClientIndex: selectedClient
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data = await response.json();
        const aiText = data.text || "I couldn't generate a response.";
        
        // Ensure minimum thinking time has passed
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, MIN_THINKING_TIME - elapsed);
        
        setTimeout(() => {
          setChatMessages(prev => [...prev, { type: "ai", text: aiText }]);
          setChatTyping(false);
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }, remainingDelay);
      } catch (error) {
        console.error("[v0] Chat error:", error);
        // Fallback to local AI - still apply thinking delay
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, MIN_THINKING_TIME - elapsed);
        
        setTimeout(() => {
          const resp = generateAIResponse(text);
          setChatMessages(prev => [...prev, { type: "ai", text: resp.text }]);
          setChatTyping(false);
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }, remainingDelay);
      }
    })();
  };


  useEffect(() => {
    const timers = [];
    [0,1,2,3].forEach((_, i) => {
      timers.push(setTimeout(() => setAnimatedKPIs(prev => { const n = [...prev]; n[i] = true; return n; }), 200 + i * 150));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const font = `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif`;

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: BG, fontFamily: font, color: TEXT, overflow: "hidden", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* ═══ MOBILE HEADER BAR ═══ */}
      {isMobile && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px", height: 56, background: WHITE,
          borderBottom: `1px solid ${BORDER}`, boxShadow: "0 1px 6px rgba(0,0,0,0.04)"
        }}>
          {selectedClient !== null ? (
            <div onClick={() => setSelectedClient(null)} style={{ cursor: "pointer", color: TEXT_SEC, padding: 6 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  width: 34, height: 34, borderRadius: "50%", background: showProfileMenu ? TEAL : "#f0f4f3",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: showProfileMenu ? WHITE : TEXT_SEC,
                  transition: "all 0.2s ease"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <>
                  <div onClick={() => setShowProfileMenu(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} />
                  <div style={{
                    position: "absolute", top: 44, left: 0, zIndex: 100,
                    width: 260, background: WHITE, borderRadius: 16,
                    border: `1px solid ${BORDER}`, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    overflow: "hidden", animation: "fadeSlideIn 0.2s ease"
                  }}>
                    {/* Header */}
                    <div style={{ padding: "18px 20px", borderBottom: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: 17, fontWeight: 700, color: TEXT }}>Coach Profile</div>
                      <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 2, textDecoration: "underline" }}>miguel@joinmmnt.com</div>
                    </div>
                    {/* Menu Items */}
                    <div style={{ padding: "8px 0" }}>
                      <div onClick={() => setShowProfileMenu(false)} style={{
                        display: "flex", alignItems: "center", gap: 14, padding: "12px 20px",
                        cursor: "pointer", transition: "background 0.15s ease"
                      }} onMouseEnter={e => e.currentTarget.style.background = "#f7faf9"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEXT_SEC} strokeWidth="1.8" strokeLinecap="round">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span style={{ fontSize: 15, fontWeight: 500, color: TEXT }}>Profile</span>
                      </div>
                      <div onClick={() => setShowProfileMenu(false)} style={{
                        display: "flex", alignItems: "center", gap: 14, padding: "12px 20px",
                        cursor: "pointer", transition: "background 0.15s ease"
                      }} onMouseEnter={e => e.currentTarget.style.background = "#f7faf9"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEXT_SEC} strokeWidth="1.8" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/>
                        </svg>
                        <span style={{ fontSize: 15, fontWeight: 500, color: TEXT }}>Help Center</span>
                      </div>
                      <div onClick={() => { setShowProfileMenu(false); setShowMiltonBrain(true); }} style={{
                        display: "flex", alignItems: "center", gap: 14, padding: "12px 20px",
                        cursor: "pointer", transition: "background 0.15s ease"
                      }} onMouseEnter={e => e.currentTarget.style.background = "#f7faf9"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round">
                          <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2H10a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"/>
                          <line x1="9" y1="21" x2="15" y2="21"/><line x1="10" y1="17" x2="10" y2="21"/><line x1="14" y1="17" x2="14" y2="21"/>
                        </svg>
                        <span style={{ fontSize: 15, fontWeight: 500, color: TEAL }}>Milton Brain</span>
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px",
                        cursor: "not-allowed", opacity: 0.5
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEXT_SEC} strokeWidth="1.8" strokeLinecap="round">
                            <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                          </svg>
                          <span style={{ fontSize: 15, fontWeight: 500, color: TEXT_SEC }}>Billing</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 500, color: TEXT_SEC }}>Coming Soon</span>
                      </div>
                      <div style={{ height: 1, background: BORDER, margin: "4px 16px" }} />
                      <div onClick={() => setShowProfileMenu(false)} style={{
                        display: "flex", alignItems: "center", gap: 14, padding: "12px 20px",
                        cursor: "pointer", transition: "background 0.15s ease"
                      }} onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        <span style={{ fontSize: 15, fontWeight: 500, color: "#dc2626" }}>Logout</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src={LOGO_URL} alt="Milton" style={{ width: 30, height: 30, borderRadius: 8 }} />
            <span style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>Milton</span>
          </div>
          <div onClick={() => setShowAddClient(true)} style={{
            width: 34, height: 34, borderRadius: 10, background: TEAL,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "0 2px 6px rgba(43,122,120,0.3)"
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/>
            </svg>
          </div>
        </div>
      )}

      {/* ═══ DESKTOP CHAT PANEL ═══ */}
      {!isMobile && (
        <div style={{
          width: 360, flexShrink: 0, padding: "14px 6px 14px 10px",
          display: "flex", flexDirection: "column"
        }}>
          <section style={{
            flex: 1, background: WHITE, display: "flex", flexDirection: "column",
            borderRadius: 20, border: `1px solid ${BORDER}`,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            overflow: "hidden"
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 14px", borderBottom: `1px solid ${BORDER}`,
              background: "rgba(247,250,249,0.5)"
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC }}>Milton</span>
              <span style={{ fontSize: 10, color: TEXT_SEC, opacity: 0.6 }}>v1.0</span>
            </div>
<ChatContent
  chatInput={chatInput} setChatInput={setChatInput}
  messages={chatMessages} onSend={handleChatSend}
  chatEndRef={chatEndRef} isMobile={false} typing={chatTyping}
  canvasType={canvasType}
            />
          </section>
        </div>
      )}

      {/* ═══ CANVAS MODE - Desktop Only (Mobile uses MobileCanvasSheet) ═══ */}
      {canvasMode && !isMobile && (
        <div style={{
          flex: 1,
          margin: "14px 14px 14px 0",
          borderRadius: 20,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          animation: "canvasSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          display: "flex", 
          flexDirection: "column",
          background: WHITE, 
          overflow: "hidden"
        }}>
          {canvasType === "templates" && (
            <CanvasTemplates 
              isMobile={isMobile}
              onSelect={(templateType) => {
                if (templateType === "mealPlan") {
                  setCanvasType("mealPlan");
                  setCanvasData({
                    client: "New Client",
                    goals: "General health and fitness",
                    weeklyTargets: { calories: 2000, protein: 150 }
                  });
} else if (templateType === "workout") {
  setCanvasType("workout");
  setCanvasData({
  clientName: "New Client",
  programName: "Custom Program",
  weeks: 4
  });
  } else if (templateType === "messages") {
  setCanvasType("messages");
  setCanvasData({});
  } else if (templateType === "reports") {
  setCanvasType("report");
  setCanvasData({});
  }
  }}
  onClose={() => { setCanvasMode(false); setCanvasData(null); setCanvasType(null); }}
  />
  )}
{canvasType === "messages" && (
  <MessagesCanvas
  onClose={() => { setCanvasMode(false); setCanvasData(null); setCanvasType(null); }}
  setChatMessages={setChatMessages}
  setChatTyping={setChatTyping}
  />
  )}
  {canvasType === "mealPlan" && (
  <MealPlanCanvas
              data={canvasData} 
              onClose={() => { setCanvasMode(false); setCanvasData(null); setCanvasType(null); }}
            />
          )}
          {canvasType === "workout" && (
            <WorkoutCanvas 
              data={canvasData}
              clients={clients}
              onClose={() => { setCanvasMode(false); setCanvasData(null); setCanvasType(null); }}
            />
          )}
          {canvasType === "messageSequence" && (
            <MessageSequenceCanvas 
              data={canvasData}
              onClose={() => { setCanvasMode(false); setCanvasData(null); setCanvasType(null); }}
            />
          )}
{canvasType === "report" && (
  <ReportsCanvas
  onClose={() => { setCanvasMode(false); setCanvasData(null); setCanvasType(null); }}
  setChatMessages={setChatMessages}
  setChatTyping={setChatTyping}
  />
  )}
{canvasType === "inbox" && (
  <InboxCanvas
  isMobile={isMobile}
  onClose={() => { setCanvasMode(false); setCanvasData(null); setCanvasType(null); }}
  />
  )}
  {canvasType === "schedule" && (
  <ScheduleCanvas
  isMobile={isMobile}
  onClose={() => { setCanvasMode(false); setCanvasData(null); setCanvasType(null); }}
  />
  )}
  </div>
  )}
  
  
  
  {/* ═══ MAIN CONTENT ═══ */}
      {!canvasMode && selectedClient !== null ? (
        <main style={{ flex: 1, overflowY: "auto" }}>
          <ClientProfile
            client={clients[selectedClient]}
            onBack={() => setSelectedClient(null)}
            isMobile={isMobile}
            reportBlocks={mainReportBlocks || ["top3", "rule30", "dataCards", "calendar", "insight"]}
            setReportBlocks={(v) => setMainReportBlocks(typeof v === "function" ? v(mainReportBlocks || ["top3", "rule30", "dataCards", "calendar", "insight"]) : v)}
            onReportOpen={(client) => {
              setChatMessages(prev => [...prev, {
                type: "ai",
                title: `${client.name.split(" ")[0]}'s Report — Milton Insight`,
                text: `${client.insight}\n\nCoaching angle: ${client.coachAngle}`
              }]);
            }}
          />
        </main>
      ) : !canvasMode ? (
      <main style={{
        flex: 1, overflowY: "auto", minHeight: 0,
        padding: isMobile ? "68px 14px 76px" : "24px 28px",
        display: "flex", flexDirection: "column", gap: isMobile ? 14 : 20
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {[
                  { icon: "calendar", label: "Schedule", action: () => { setCanvasType("schedule"); setCanvasData({}); setCanvasMode(true); } },
                  { icon: "inbox", label: "Inbox", action: () => { setCanvasType("inbox"); setCanvasData({}); setCanvasMode(true); } },
                  { icon: "canvas", label: "Canvas", action: () => { setCanvasType("templates"); setCanvasData({}); setCanvasMode(true); } }
                ].map(item => (
                  <div
                    key={item.icon}
                    onClick={item.action}
                    style={{
                      width: isMobile ? 32 : 36, 
                      height: isMobile ? 32 : 36, 
                      borderRadius: 10,
                      background: "#f0f4f3", border: `1px solid ${BORDER}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: item.action ? "pointer" : "default", color: TEXT_SEC,
                      opacity: item.action ? 1 : 0.5,
                      transition: "all 0.15s ease"
                    }}
                    title={item.label}
                    onMouseEnter={e => { if (item.action && !isMobile) { e.currentTarget.style.background = TEAL_LIGHT; e.currentTarget.style.color = TEAL; e.currentTarget.style.borderColor = TEAL; } }}
                    onMouseLeave={e => { if (!isMobile) { e.currentTarget.style.background = "#f0f4f3"; e.currentTarget.style.color = TEXT_SEC; e.currentTarget.style.borderColor = BORDER; } }}
                  >
                    <NavIcon icon={item.icon} size={isMobile ? 16 : 18} />
                  </div>
                ))}
              </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!isMobile && (<>
              <div onClick={() => setShowAddClient(true)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                background: TEAL, borderRadius: 10, color: "#fff",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                boxShadow: "0 2px 8px rgba(43,122,120,0.3)",
                transition: "all 0.15s ease"
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#236664"}
                onMouseLeave={e => e.currentTarget.style.background = TEAL}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                  <line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/>
                </svg>
                Add Client
              </div>
              <div style={{ position: "relative" }}>
                <div 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  style={{
                    width: 38, height: 38, borderRadius: "50%", 
                    background: showProfileMenu ? TEAL : "#f0f4f3",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: showProfileMenu ? WHITE : TEXT_SEC, 
                    border: `1px solid ${showProfileMenu ? TEAL : BORDER}`,
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={e => { if (!showProfileMenu) { e.currentTarget.style.background = TEAL_LIGHT; e.currentTarget.style.color = TEAL; }}}
                  onMouseLeave={e => { if (!showProfileMenu) { e.currentTarget.style.background = "#f0f4f3"; e.currentTarget.style.color = TEXT_SEC; }}}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                {/* Profile Menu Dropdown */}
                {showProfileMenu && (
                  <>
                    <div onClick={() => setShowProfileMenu(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} />
                    <div style={{
                      position: "absolute", top: 48, right: 0, zIndex: 100,
                      width: 280, background: WHITE, borderRadius: 16,
                      border: `1px solid ${BORDER}`, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                      overflow: "hidden", animation: "fadeSlideIn 0.2s ease"
                    }}>
                      {/* Header */}
                      <div style={{ padding: "20px 22px", borderBottom: `1px solid ${BORDER}` }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>Coach Profile</div>
                        <div style={{ fontSize: 14, color: TEXT_SEC, marginTop: 4, textDecoration: "underline", cursor: "pointer" }}>miguel@joinmmnt.com</div>
                      </div>
                      {/* Menu Items */}
                      <div style={{ padding: "8px 0" }}>
                        <div onClick={() => setShowProfileMenu(false)} style={{
                          display: "flex", alignItems: "center", gap: 14, padding: "14px 22px",
                          cursor: "pointer", transition: "background 0.15s ease"
                        }} onMouseEnter={e => e.currentTarget.style.background = "#f7faf9"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TEXT_SEC} strokeWidth="1.8" strokeLinecap="round">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                          <span style={{ fontSize: 16, fontWeight: 500, color: TEXT }}>Profile</span>
                        </div>
                        <div onClick={() => setShowProfileMenu(false)} style={{
                          display: "flex", alignItems: "center", gap: 14, padding: "14px 22px",
                          cursor: "pointer", transition: "background 0.15s ease"
                        }} onMouseEnter={e => e.currentTarget.style.background = "#f7faf9"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TEXT_SEC} strokeWidth="1.8" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/>
                          </svg>
                          <span style={{ fontSize: 16, fontWeight: 500, color: TEXT }}>Help Center</span>
                        </div>
                        <div onClick={() => { setShowProfileMenu(false); setShowMiltonBrain(true); }} style={{
                          display: "flex", alignItems: "center", gap: 14, padding: "14px 22px",
                          cursor: "pointer", transition: "background 0.15s ease"
                        }} onMouseEnter={e => e.currentTarget.style.background = "#f7faf9"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round">
                            <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2H10a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"/>
                            <line x1="9" y1="21" x2="15" y2="21"/><line x1="10" y1="17" x2="10" y2="21"/><line x1="14" y1="17" x2="14" y2="21"/>
                          </svg>
                          <span style={{ fontSize: 16, fontWeight: 500, color: TEAL }}>Milton Brain</span>
                        </div>
                        <div style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px",
                          cursor: "not-allowed", opacity: 0.5
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TEXT_SEC} strokeWidth="1.8" strokeLinecap="round">
                              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                            </svg>
                            <span style={{ fontSize: 16, fontWeight: 500, color: TEXT_SEC }}>Billing</span>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 500, color: TEXT_SEC }}>Coming Soon</span>
                        </div>
                        <div style={{ height: 1, background: BORDER, margin: "4px 18px" }} />
                        <div onClick={() => setShowProfileMenu(false)} style={{
                          display: "flex", alignItems: "center", gap: 14, padding: "14px 22px",
                          cursor: "pointer", transition: "background 0.15s ease"
                        }} onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
                          </svg>
                          <span style={{ fontSize: 16, fontWeight: 500, color: "#dc2626" }}>Logout</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>)}
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? 10 : 14 }}>

          {/* ── Card 1: Active Clients - Person Icons ── */}
          <div style={{
            background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: isMobile ? "14px" : "18px 20px",
            opacity: animatedKPIs[0] ? 1 : 0, transform: animatedKPIs[0] ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)", display: "flex", flexDirection: "column",
            minWidth: 0, overflow: "hidden"
          }}>
            <div style={{ fontSize: 11, color: TEXT_SEC, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Active Clients</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: isMobile ? 12 : 16 }}>
              <span style={{ fontSize: isMobile ? 28 : 36, fontWeight: 700, color: TEXT, letterSpacing: "-0.03em", lineHeight: 1 }}>12</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: ALERT_GREEN, background: "#e8f5e9", padding: "2px 7px", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 2 }}>
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke={ALERT_GREEN} strokeWidth="2" strokeLinecap="round"><polyline points="1,8 6,3 11,8" /></svg>
                +3
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: "auto" }}>
              {Array.from({ length: 12 }).map((_, j) => {
                const colors = ["#2B7A78", "#3aafa9", "#5CDB95", "#45818e", "#6aa84f", "#e06666", "#f6b26b", "#8e7cc3", "#2B7A78", "#3aafa9", "#45818e", "#5CDB95"];
                return (
                  <svg key={j} width={isMobile ? 22 : 26} height={isMobile ? 22 : 26} viewBox="0 0 26 26">
                    <circle cx="13" cy="10" r="5" fill={colors[j]} opacity="0.85"/>
                    <ellipse cx="13" cy="22" rx="7" ry="5" fill={colors[j]} opacity="0.5"/>
                  </svg>
                );
              })}
            </div>
          </div>

          {/* ── Card 2: Attendance Rate - Dot Grid ── */}
          <div style={{
            background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: isMobile ? "14px" : "18px 20px",
            opacity: animatedKPIs[1] ? 1 : 0, transform: animatedKPIs[1] ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)", display: "flex", flexDirection: "column",
            minWidth: 0, overflow: "hidden"
          }}>
            <div style={{ fontSize: 11, color: TEXT_SEC, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Attendance Rate</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: isMobile ? 10 : 14 }}>
              <span style={{ fontSize: isMobile ? 28 : 36, fontWeight: 700, color: TEXT, letterSpacing: "-0.03em", lineHeight: 1 }}>83%</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: ALERT_GREEN, background: "#e8f5e9", padding: "2px 7px", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 2 }}>
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke={ALERT_GREEN} strokeWidth="2" strokeLinecap="round"><polyline points="1,8 6,3 11,8" /></svg>
                +12%
              </span>
            </div>
            {(() => {
              const total = 12;
              const engaged = 10;
              const dotSize = isMobile ? 20 : 24;
              const engagedColors = ["#2B7A78", "#3aafa9", "#5CDB95", "#45818e", "#2B7A78", "#3aafa9", "#6aa84f", "#5CDB95", "#45818e", "#2B7A78"];
              return (
                <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 5 : 6, marginTop: "auto" }}>
                  {Array.from({ length: total }).map((_, j) => {
                    const isEngaged = j < engaged;
                    return (
                      <div key={j} style={{
                        width: dotSize, height: dotSize, borderRadius: "50%",
                        background: isEngaged ? engagedColors[j] : "transparent",
                        border: isEngaged ? "none" : `2px dashed #c8d8d4`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.4s ease",
                        transitionDelay: `${j * 0.04}s`
                      }}>
                        {isEngaged && (
                          <svg width={dotSize * 0.5} height={dotSize * 0.5} viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="2,6 5,9 10,3" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <div style={{ fontSize: 11, color: TEXT_SEC, fontWeight: 500, marginTop: 8 }}>
              <span style={{ fontWeight: 700, color: TEXT }}>10</span> of 12 clients engaged
            </div>
          </div>

          {/* ── Card 3: Client Growth - Progressive Bar Chart ── */}
          <div style={{
            background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: isMobile ? "14px" : "18px 20px",
            opacity: animatedKPIs[2] ? 1 : 0, transform: animatedKPIs[2] ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)", display: "flex", flexDirection: "column",
            minWidth: 0, overflow: "hidden"
          }}>
            <div style={{ fontSize: 11, color: TEXT_SEC, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Client Growth</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: isMobile ? 10 : 14 }}>
              <span style={{ fontSize: isMobile ? 28 : 36, fontWeight: 700, color: TEXT, letterSpacing: "-0.03em", lineHeight: 1 }}>12</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: ALERT_GREEN, background: "#e8f5e9", padding: "2px 7px", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 2 }}>
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke={ALERT_GREEN} strokeWidth="2" strokeLinecap="round"><polyline points="1,8 6,3 11,8" /></svg>
                +12
              </span>
            </div>
            {(() => {
              const months = [
                { label: "Jul", value: 1 },
                { label: "Aug", value: 2 },
                { label: "Sep", value: 3 },
                { label: "Oct", value: 5 },
                { label: "Nov", value: 7 },
                { label: "Dec", value: 8 },
                { label: "Jan", value: 10 },
                { label: "Feb", value: 12 },
              ];
              const maxVal = 12;
              const barH = isMobile ? 50 : 60;
              return (
                <div style={{ display: "flex", alignItems: "flex-end", gap: isMobile ? 3 : 5, flex: 1, marginTop: "auto" }}>
                  {months.map((m, j) => {
                    const h = Math.max(3, (m.value / maxVal) * barH);
                    const isLast = j === months.length - 1;
                    const intensity = 0.15 + (j / (months.length - 1)) * 0.85;
                    return (
                      <div key={j} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: isLast ? TEAL : TEXT_SEC }}>
                          {m.value}
                        </span>
                        <div style={{
                          width: "100%", height: h, borderRadius: 4,
                          background: isLast
                            ? `linear-gradient(180deg, ${TEAL}, ${SAGE})`
                            : `rgba(43,122,120,${intensity})`,
                          transition: "height 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                          transitionDelay: `${j * 0.07}s`
                        }} />
                        <span style={{ fontSize: 9, color: TEXT_SEC, fontWeight: 500 }}>{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* ── Card 4: Success Rate - Progressive Bar Chart ── */}
          <div style={{
            background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: isMobile ? "14px" : "18px 20px",
            opacity: animatedKPIs[3] ? 1 : 0, transform: animatedKPIs[3] ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)", display: "flex", flexDirection: "column",
            minWidth: 0, overflow: "hidden"
          }}>
            <div style={{ fontSize: 11, color: TEXT_SEC, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Success Rate</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: isMobile ? 10 : 14 }}>
              <span style={{ fontSize: isMobile ? 28 : 36, fontWeight: 700, color: TEXT, letterSpacing: "-0.03em", lineHeight: 1 }}>73%</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: ALERT_GREEN, background: "#e8f5e9", padding: "2px 7px", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 2 }}>
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke={ALERT_GREEN} strokeWidth="2" strokeLinecap="round"><polyline points="1,8 6,3 11,8" /></svg>
                +8%
              </span>
            </div>
            {(() => {
              const months = [
                { label: "Jul", value: 52 },
                { label: "Aug", value: 55 },
                { label: "Sep", value: 58 },
                { label: "Oct", value: 61 },
                { label: "Nov", value: 65 },
                { label: "Dec", value: 68 },
                { label: "Jan", value: 70 },
                { label: "Feb", value: 73 },
              ];
              const minVal = months[0].value;
              const maxVal = months[months.length - 1].value;
              const barH = isMobile ? 50 : 60;
              return (
                <div style={{ display: "flex", alignItems: "flex-end", gap: isMobile ? 3 : 5, flex: 1, marginTop: "auto", minWidth: 0 }}>
                  {months.map((m, j) => {
                    const h = Math.max(10, ((m.value - minVal) / (maxVal - minVal)) * barH) || barH;
                    const isLast = j === months.length - 1;
                    const intensity = 0.12 + (j / (months.length - 1)) * 0.88;
                    return (
                      <div key={j} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 4, minWidth: 0 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: isLast ? SAGE : TEXT_SEC, whiteSpace: "nowrap" }}>
                          {m.value}%
                        </span>
                        <div style={{
                          width: "100%", height: h, borderRadius: 4,
                          background: isLast
                            ? `linear-gradient(180deg, ${MINT}, ${SAGE})`
                            : `rgba(92,219,149,${intensity})`,
                          transition: "height 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                          transitionDelay: `${j * 0.07}s`
                        }} />
                        <span style={{ fontSize: 9, color: TEXT_SEC, fontWeight: 500 }}>{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

        </div>

        {/* Coaching Queue */}
        <div style={{
          background: WHITE, borderRadius: 16, padding: isMobile ? "16px" : "20px 24px",
          border: `1px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(0,0,0,0.03)"
        }}>
          <div style={{ marginBottom: 14 }}>
            <span style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: TEXT }}>Today's Coaching Queue</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 8 : 10 }}>
            {[
              {
                count: clients.filter(c => c.alertType === "red").length, label: "Clients Attention", filterType: "red",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#fee2e2"/>
                    <circle cx="12" cy="12" r="6" fill="#fca5a5"/>
                    <circle cx="12" cy="12" r="2.5" fill="#ef4444"/>
                  </svg>
                )
              },
              {
                count: clients.filter(c => c.alertType === "blue").length, label: "Reports Ready", filterType: "blue",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="3" width="16" height="18" rx="3" fill="#dbeafe"/>
                    <rect x="7" y="7" width="6" height="1.5" rx="0.75" fill="#60a5fa"/>
                    <rect x="7" y="10.5" width="10" height="1.5" rx="0.75" fill="#93c5fd"/>
                    <rect x="7" y="14" width="8" height="1.5" rx="0.75" fill="#93c5fd"/>
                    <circle cx="17" cy="17" r="5" fill="#34d399"/>
                    <polyline points="14.5,17 16.2,18.7 19.5,15.3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                )
              },
              {
                count: clients.filter(c => c.alertType === "green").length, label: "Client Milestone", filterType: "green",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="9" r="5" fill="#e9d5ff"/>
                    <path d="M12 4l1.5 3 3.5.5-2.5 2.4.6 3.5L12 12l-3.1 1.4.6-3.5L7 7.5l3.5-.5z" fill="#a78bfa"/>
                    <path d="M6 18c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  </svg>
                )
              },
            ].map((q, i) => {
              const isActive = clientFilter === q.filterType;
              return (
              <div key={i} onClick={() => setClientFilter(isActive ? null : q.filterType)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: isMobile ? "10px 14px" : "10px 16px",
                borderRadius: 28,
                background: isActive ? TEAL : "#f8faf9",
                border: isActive ? `1px solid ${TEAL}` : `1px solid ${BORDER}`,
                cursor: "pointer",
                boxShadow: isActive ? "0 2px 10px rgba(43,122,120,0.3)" : "0 1px 3px rgba(0,0,0,0.03)",
                transition: "all 0.2s ease", whiteSpace: "nowrap",
                transform: isActive ? "scale(1.03)" : "scale(1)"
              }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)"; e.currentTarget.style.transform = "scale(1)"; }}}
              >
                {q.icon}
                <span style={{ fontSize: 13, fontWeight: 600, color: isActive ? "#fff" : TEXT }}>
                  {q.count} {q.label}
                </span>
                {isActive && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                )}
              </div>
              );
            })}
          </div>
        </div>

        {/* Client Table / List */}
        {clientFilter && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 16px", borderRadius: 12, background: TEAL_LIGHT,
            border: `1px solid #b6dfd8`
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: TEAL }}>
              Showing: {clientFilter === "red" ? "Needs Attention" : clientFilter === "blue" ? "Report Ready" : "Made Progress"} ({clients.filter(c => c.alertType === clientFilter).length})
            </span>
            <div onClick={() => setClientFilter(null)} style={{ cursor: "pointer", color: TEAL, display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
              Clear filter
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
          </div>
        )}
        {isMobile ? (
          /* ─── Mobile: Individual client cards ─── */
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {clients.filter(c => !clientFilter || c.alertType === clientFilter).map((client, _fi) => { const i = clients.indexOf(client); return (
              <div key={i} onClick={() => setSelectedClient(i)} style={{
                background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`,
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)", padding: "16px",
                display: "flex", flexDirection: "column", gap: 12, cursor: "pointer"
              }}>
                {/* Row 1: Avatar + Name + Badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={client.name} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{client.name}</span>
                    <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2 }}>{client.program || "General Fitness"}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <AlertBadge type={client.alertType} label={client.alert} />
                    <StreakBadge streak={client.streak?.current || client.streaks || 0} compact />
                  </div>
                </div>

                {/* Goal */}
                {client.goals?.primary && (
                  <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.5, padding: "0 2px" }}>
                    Goal: <span style={{ fontWeight: 600, color: TEAL }}>{client.goals.primary}</span>
                  </div>
                )}

                {/* Row 3: Sessions progress */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC }}>
                    Sessions: <span style={{ color: TEAL, fontWeight: 700 }}>{client.sessionsThisWeek || 0}/{client.sessionsPerWeek || 3}</span> this week
                  </div>
                  <div style={{ fontSize: 12, color: TEXT_SEC }}>
                    {client.totalSessions || 0} total
                  </div>
                </div>
                <div style={{ width: "100%", height: 6, borderRadius: 3, background: "#e8f0ee" }}>
                  <div style={{
                    width: `${Math.min(100, ((client.sessionsThisWeek || 0) / (client.sessionsPerWeek || 3)) * 100)}%`, 
                    height: "100%", borderRadius: 3,
                    background: `linear-gradient(90deg, ${TEAL}, ${MINT})`,
                    transition: "width 1s ease"
                  }} />
                </div>
              </div>
            ); })}
          </div>
        ) : (
          /* ─── Desktop: Table ─── */
          <div style={{
            background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.03)", overflow: "hidden", flex: 1,
            display: "flex", flexDirection: "column", minHeight: 0
          }}>
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 0.8fr 1fr 36px",
              padding: "12px 24px", background: "#fafcfb",
              borderBottom: `1px solid ${BORDER}`, fontSize: 12, fontWeight: 600,
              color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.05em",
              flexShrink: 0
            }}>
              <span>Client</span><span>Status</span><span>Sessions</span><span>Goal</span><span />
            </div>
            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            {clients.filter(c => !clientFilter || c.alertType === clientFilter).map((client, _fi) => { const i = clients.indexOf(client); return (
              <div key={i}
                onClick={() => setSelectedClient(i)}
                onMouseEnter={() => setHoveredClient(i)} onMouseLeave={() => setHoveredClient(null)}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 0.8fr 1fr 36px",
                  padding: "14px 24px", alignItems: "center",
                  borderBottom: i < clients.length - 1 ? `1px solid ${BORDER}` : "none",
                  background: hoveredClient === i ? "#f7faf9" : "transparent",
                  transition: "background 0.15s ease", cursor: "pointer"
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={client.name} size={34} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{client.name}</div>
                    <div style={{ fontSize: 11, color: TEXT_SEC, marginTop: 2 }}>{client.program || "General Fitness"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><AlertBadge type={client.alertType} label={client.alert} /><StreakBadge streak={client.streak?.current || client.streaks || 0} compact /></div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: TEAL }}>{client.sessionsThisWeek || 0}</span>
                  <span style={{ fontSize: 12, color: TEXT_SEC }}>/ {client.sessionsPerWeek || 3}</span>
                </div>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>
                    {client.goals?.primary || "Build Strength"}
                  </span>
                </div>
                <div style={{ color: TEXT_SEC, display: "flex", justifyContent: "center" }}>
                  <NavIcon icon="chevron" size={16} />
                </div>
              </div>
            ); })}
            </div>
          </div>
        )}
      </main>
      ) : null}

{/* ═══ ADD CLIENT MODAL ═══ */}
  {showAddClient && <AddClientModal onClose={() => setShowAddClient(false)} isMobile={isMobile} />}

  {/* ═══ MILTON BRAIN MODAL ═══ */}
  {showMiltonBrain && (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: isMobile ? 16 : 40, animation: "fadeSlideIn 0.2s ease"
    }} onClick={() => setShowMiltonBrain(false)}>
      <div onClick={e => e.stopPropagation()} style={{
        background: WHITE, borderRadius: 20, width: "100%", maxWidth: 560,
        maxHeight: isMobile ? "85vh" : "80vh", display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: isMobile ? "18px 20px" : "24px 28px", borderBottom: `1px solid ${BORDER}`,
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: `${TEAL}12`,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2H10a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"/>
                <line x1="9" y1="21" x2="15" y2="21"/><line x1="10" y1="17" x2="10" y2="21"/><line x1="14" y1="17" x2="14" y2="21"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>Milton Brain</div>
              <div style={{ fontSize: 13, color: TEXT_SEC }}>Train your AI with custom documents</div>
            </div>
          </div>
          <div onClick={() => setShowMiltonBrain(false)} style={{
            width: 36, height: 36, borderRadius: 10, background: "#f0f2f1",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEXT_SEC} strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: isMobile ? "20px" : "24px 28px" }}>
          {/* Upload Area */}
          <div 
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf,.doc,.docx,.txt,.md';
              input.multiple = true;
              input.onchange = (e) => {
                const files = Array.from(e.target.files);
                if (files.length > 0) {
                  setUploadingDoc(true);
                  setTimeout(() => {
                    const newDocs = files.map((f, i) => ({
                      id: Date.now() + i,
                      name: f.name,
                      size: (f.size / (1024 * 1024)).toFixed(1) + " MB",
                      date: new Date().toISOString().split('T')[0],
                      status: "processing"
                    }));
                    setBrainDocuments(prev => [...newDocs, ...prev]);
                    setUploadingDoc(false);
                    setTimeout(() => {
                      setBrainDocuments(prev => prev.map(d => 
                        d.status === "processing" ? { ...d, status: "processed" } : d
                      ));
                    }, 2000);
                  }, 1000);
                }
              };
              input.click();
            }}
            style={{
              border: `2px dashed ${BORDER}`, borderRadius: 16, padding: "32px 24px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
              cursor: "pointer", transition: "all 0.2s ease", background: "#fafbfa",
              marginBottom: 24
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.background = `${TEAL}05`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = "#fafbfa"; }}
          >
            {uploadingDoc ? (
              <>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", border: `3px solid ${BORDER}`,
                  borderTopColor: TEAL, animation: "spin 1s linear infinite"
                }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Uploading...</div>
              </>
            ) : (
              <>
                <div style={{
                  width: 56, height: 56, borderRadius: 14, background: `${TEAL}12`,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>Upload Documents</div>
                  <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 4 }}>PDF, DOC, DOCX, TXT, or MD files</div>
                </div>
              </>
            )}
          </div>

          {/* Uploaded Documents */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
              Uploaded Documents ({brainDocuments.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {brainDocuments.map(doc => (
                <div key={doc.id} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                  background: "#f7faf9", borderRadius: 12, border: `1px solid ${BORDER}`
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: doc.name.endsWith('.pdf') ? "#fee2e2" : doc.name.endsWith('.docx') || doc.name.endsWith('.doc') ? "#dbeafe" : "#f3e8ff",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" 
                      stroke={doc.name.endsWith('.pdf') ? "#ef4444" : doc.name.endsWith('.docx') || doc.name.endsWith('.doc') ? "#3b82f6" : "#a855f7"} 
                      strokeWidth="1.8" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
                    <div style={{ fontSize: 12, color: TEXT_SEC }}>{doc.size} • {doc.date}</div>
                  </div>
                  {doc.status === "processing" ? (
                    <div style={{
                      padding: "4px 10px", borderRadius: 8, background: "#fef3c7", color: "#d97706",
                      fontSize: 11, fontWeight: 600
                    }}>Processing</div>
                  ) : (
                    <div style={{
                      padding: "4px 10px", borderRadius: 8, background: "#dcfce7", color: "#16a34a",
                      fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                      Processed
                    </div>
                  )}
                  <div onClick={() => setBrainDocuments(prev => prev.filter(d => d.id !== doc.id))} style={{
                    width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: TEXT_SEC, transition: "all 0.15s ease"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ef4444"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = TEXT_SEC; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                  </div>
                </div>
              ))}
              {brainDocuments.length === 0 && (
                <div style={{ textAlign: "center", padding: "24px", color: TEXT_SEC, fontSize: 14 }}>
                  No documents uploaded yet. Upload files to train Milton on your coaching methodology.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: isMobile ? "16px 20px" : "18px 28px", borderTop: `1px solid ${BORDER}`,
          background: "#fafbfa", display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ fontSize: 13, color: TEXT_SEC }}>
            {brainDocuments.filter(d => d.status === "processed").length} documents trained
          </div>
          <button onClick={() => setShowMiltonBrain(false)} style={{
            padding: "10px 20px", borderRadius: 10, border: "none",
            background: TEAL, color: WHITE, fontSize: 14, fontWeight: 600, cursor: "pointer"
          }}>Done</button>
        </div>
      </div>
    </div>
  )}
  
  {/* ��══ MOBILE GLASS CHAT BAR + SHEET ═══ */}
  {isMobile && (
    <MobileChatSheet
      chatOpen={chatOpen} setChatOpen={setChatOpen}
      chatInput={chatInput} setChatInput={setChatInput}
      messages={chatMessages} onSend={handleChatSend}
      chatEndRef={chatEndRef} typing={chatTyping}
      canvasMode={canvasMode}
    />
  )}
  
  {/* ═══ MOBILE CANVAS SHEET - Swipe up drawer ═��═ */}
  {isMobile && (
    <MobileCanvasSheet
      isOpen={canvasMode}
      onClose={() => { setCanvasMode(false); setCanvasData(null); setCanvasType(null); }}
      canvasType={canvasType}
      canvasData={canvasData}
      setCanvasType={setCanvasType}
      setCanvasData={setCanvasData}
      setCanvasMode={setCanvasMode}
      setChatMessages={setChatMessages}
      setChatTyping={setChatTyping}
      onChatSend={handleChatSend}
      clients={clients}
    />
  )}

      <style>{`
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
  }
  @keyframes dotBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
  }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
@keyframes typingDot {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
  }
  @keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
  }
        @keyframes canvasSlideIn {
          from { opacity: 0; transform: scale(0.96) translateX(20px); }
          to { opacity: 1; transform: scale(1) translateX(0); }
        }
        @keyframes canvasCellReveal {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(43, 122, 120, 0.3); }
          50% { box-shadow: 0 0 20px 4px rgba(43, 122, 120, 0.15); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 3px; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        input::placeholder { color: ${TEXT_SEC}; opacity: 0.7; }
      `}</style>
    </div>
  );
}
