import DeleteIcon from '@mui/icons-material/Delete'
import { Alert, Box, Button, ButtonGroup } from '@mui/material'

import propose from 'propose'

import { useState } from 'react'
import { useParams } from 'react-router'

import { publishPollen } from '../lib/sheet'
import { pollensList } from '../data/arrays'

interface Props {
  date: string
}

export default function Speech({ date }: Props) {
  const { sheetId } = useParams()
  
  const [interval, setInterval] = useState('_0h')
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)

  // Ok
  function hourCommand(hour: number) {
    if (isNaN(hour)) return
    if (hour >= 0 && hour <= 23) setInterval(`_${hour}h`)
  }

  // Ok
  async function pollenCommand(
    proposedPollen: string,
    amount: number,
    operation: string
  ) {
    if (isNaN(amount)) return
    if (!pollensList.find((p) => p === proposedPollen)) return

    amount = operation === '+' ? amount : -amount
    await publishPollen({
      pollen: proposedPollen,
      sheetId: sheetId!,
      interval,
      amount,
      date,
    })
  } 

  function processCommand(text: string) {
    const parts = text.split(' ')

    if (parts.length < 2) return
    
    const firstArgument = parts[0]
    const secondArgument = Number(parts[1])

    const hourLabel = propose(firstArgument, ['hour', 'time'], {
      ignoreCase: true,
      threshold:0.5,
    })

    if(hourLabel){
      hourCommand(secondArgument)
      return
    }

    const pollen = propose(firstArgument, pollensList, {
      ignoreCase: true,
      threshold: 0.5,
    })

    if(pollen){
      pollenCommand(pollen, secondArgument, '+')
    }
  }
  

  return (
    <Box className="flex w-full flex-col items-center justify-center">
      <ButtonGroup disableElevation variant="contained" className="py-2">
        <Button onClick={handleListening}>Listen</Button>
        {isListening && <Button onClick={stopHandle}>Stop</Button>}
      </ButtonGroup>

      {isListening && (
        <Alert
          style={{ color: '#233143', backgroundColor: '#b8bcc2' }}
          severity="info"
        >
          Listening...
        </Alert>
      )}

      {transcript && (
        <Box className="justify-center p-2">
          <Box sx={{ color: '#5e6060' }}>{transcript}</Box>
          <br />
          <Button
            onClick={handleReset}
            variant="outlined"
            startIcon={<DeleteIcon />}
          >
            Reset
          </Button>
        </Box>
      )}
    </Box>
  )
}
