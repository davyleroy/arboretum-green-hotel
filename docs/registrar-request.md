# Registrar request message (WhatsApp-ready)

Copy the block between the `~~~` fences below, straight into WhatsApp.
Before you send:

1. Replace `[Name]` with the account holder's first name.
2. Replace `[Your name]` at the bottom with yours.
3. On Tuesday night, come back and replace the `[sent Tue]` placeholders
   with the booking-host target + the Vercel A record + the Vercel www CNAME
   target once you have them. Or send those as a follow-up message in the
   same thread.

Nothing in this file is secret. Safe to leave in the repo.

---

~~~
Hi [Name],

The new Arboretum Green Hotel website is ready to go live on *Sunday 15 November at 08:00*. To put it onto arboretumgreenhotel.rw without interrupting the current booking system, I need two short registrar sessions on back-to-back days:

• *Wed 11 Nov* - prep only, nothing changes publicly
• *Thu 12 Nov around 09:00* - the actual cutover

Both sessions are low-risk and low-effort on your side.

---

*How it works*

You make every change yourself on the registrar panel. I never need your login. After each change, please send:

1. A screenshot of the saved record showing it in the record list
2. A short confirmation ("Wednesday done")

I run a public DNS check from my side. If everything matches, we move on. If something was typed wrong, I write back with the exact record to re-edit.

Fallback only if a value gets typed wrong under time pressure: a 15 minute screen-share where I read values while you type. No password shared, invoked only if needed.

---

*Wed 11 Nov - please make these changes*

1. Lower the TTL to *300 seconds* on the existing apex A record (arboretumgreenhotel.rw) and the www record. Values stay the same, only TTL drops.

2. Add a new CNAME for Google Search Console:

```
Host:  kp7fatlmi3dh
Value: gv-jt4m3wturavpmr.dv.googlehosted.com
TTL:   3600
```

3. Add a new record for the current booking system (I will send the exact IP or target Tuesday night):

```
Host:  book
Type:  A or CNAME (TBD)
Value: [sent Tue]
TTL:   3600
```

---

*Thu 12 Nov around 09:00 - the cutover*

I will send the exact values Tuesday night. Summary:

• Change the apex A record to the Vercel-assigned value
• Delete any AAAA record on the apex if one exists
• Change the www CNAME to the Vercel-assigned target
• Delete any A record on www
• Add a CAA record *only if* other CAA records already exist

---

*PLEASE DO NOT TOUCH*

MX, SPF, DKIM, DMARC, NS, and any TXT record I have not asked about. One wrong edit on MX takes the hotel email offline. If you see something you do not recognise, stop and call me before changing it.

---

*What I need back by Tuesday 10 Nov 20:00*

1. Confirmation this arrangement works for you
2. A 10-15 min window you can be available on Wed morning
3. A 10-15 min window you can be available on Thu around 09:00
4. Your mobile for those two sessions

If I do not hear by Tuesday evening we postpone the launch by one week. Please reply to this message as soon as you can.

Thank you,
[Your name]
~~~

---

## Tuesday night follow-up template

Once you have the booking-host target and the two Vercel-assigned values, send this as a reply in the same WhatsApp thread:

~~~
Here are the final values for tomorrow (Wed) and Thursday:

*Wed book record:*
```
Host:  book
Type:  [A or CNAME]
Value: [actual value from booking host]
```

*Thu apex A record (will replace the current one):*
```
Host:  @  (or leave blank for apex)
Type:  A
Value: [exact value Vercel showed me]
```

*Thu www CNAME (will replace the current one):*
```
Host:  www
Type:  CNAME
Value: [exact target Vercel showed me]
```

Please do not use any value you see in a web guide; only these exact values.

Looking forward to Wed.
~~~

---

## If Gate 1 fails (holder does not reply by Tuesday 20:00)

Send this escalation to both the holder and the hotel manager:

~~~
Quick nudge: I have not heard back about the DNS changes needed to launch the new website this Sunday. The deadline for confirmation was tonight at 20:00.

If I do not hear by tomorrow morning, we will have to postpone the launch to Sunday 22 November. The hotel's current booking system is not affected either way; this only concerns the new marketing site.

Please reply with your availability for Wed and Thu even if briefly.

Thank you.
~~~
