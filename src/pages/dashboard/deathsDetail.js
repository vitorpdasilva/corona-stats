import React, { useState } from 'react';
import { Divider, Flag, Accordion, Icon, Loader } from 'semantic-ui-react'

const DeathsDetail = ({ deaths, selectedCountry, detail }) => {
  const [activeAccordionIndex, setActiveAccordionIndex] = useState(0)
  if (!selectedCountry || !detail) return <Loader active inline size='mini'/>;
  return (
    <>
      <Divider hidden />
      <Flag name={selectedCountry.toLowerCase()} /> Where the <strong>deaths</strong> happened
      <Accordion fluid styled>
        {detail.map((i, index) => (
          <div key={index}>
            <Accordion.Title
              active={activeAccordionIndex === index}
              index={index}
              onClick={() => setActiveAccordionIndex(index)}
            >
              <Icon name='dropdown' />
              {i.state && i.state !== 'null' ? i.state : 'Province or State not provided'}
            </Accordion.Title>
            <Accordion.Content active={activeAccordionIndex === index}>
              Confirmed cases: {i.confirmed} <br />
              Confirmed deaths: {i.deaths} <br />
            </Accordion.Content>
          </div>
        ))}
      </Accordion>
    </>
  )
}

export default DeathsDetail;