const steps = [
  { number: '01', title: 'Create your account', text: 'Choose a donor or receiver account and add your community location.' },
  { number: '02', title: 'Publish or discover', text: 'Donors publish genuine resources. Receivers browse verified available listings.' },
  { number: '03', title: 'Send a request', text: 'Receivers request the quantity they need from an available donation.' },
  { number: '04', title: 'Connect safely', text: 'Donors review requests and coordinate the handover with the receiver.' },
  { number: '05', title: 'Complete the handover', text: 'The donation status is updated so the community can see what is still available.' },
];

function HowItWorks() {
  return (
    <div className="page-shell">
      <div className="container">
        <div className="section-header">
          <span className="kicker">A clear path from need to help</span>
          <h1>How GiveBridge Works</h1>
          <p>GiveBridge connects real donor listings with receivers nearby through a simple, trackable process.</p>
        </div>
        <div className="steps how-it-works-page">
          {steps.map((step) => (
            <article className="step-card" key={step.number}>
              <div className="step-number">{step.number}</div>
              <h2>{step.title}</h2>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;
