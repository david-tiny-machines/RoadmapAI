import React, { useState } from 'react';
import type { NextPage } from 'next';
import { Button, Input, Select, Card } from '../components/common';

const ComponentsDemo: NextPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Component Library</h1>
        
        {/* Buttons Section */}
        <Card title="Buttons" className="mb-8">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="danger">Danger Button</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="sm">Small Button</Button>
              <Button size="md">Medium Button</Button>
              <Button size="lg">Large Button</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button isLoading>Loading Button</Button>
              <Button disabled>Disabled Button</Button>
              <Button fullWidth>Full Width Button</Button>
            </div>
          </div>
        </Card>

        {/* Inputs Section */}
        <Card title="Inputs" className="mb-8">
          <div className="space-y-4">
            <Input
              label="Basic Input"
              placeholder="Enter text here"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input
              label="Input with Helper Text"
              helperText="This is a helper text"
              placeholder="Enter text here"
            />
            <Input
              label="Input with Error"
              error="This is an error message"
              placeholder="Enter text here"
            />
            <Input
              label="Full Width Input"
              fullWidth
              placeholder="This input takes full width"
            />
          </div>
        </Card>

        {/* Selects Section */}
        <Card title="Selects" className="mb-8">
          <div className="space-y-4">
            <Select
              label="Basic Select"
              options={selectOptions}
              value={selectValue}
              onChange={setSelectValue}
            />
            <Select
              label="Select with Helper Text"
              options={selectOptions}
              helperText="This is a helper text"
            />
            <Select
              label="Select with Error"
              options={selectOptions}
              error="This is an error message"
            />
            <Select
              label="Full Width Select"
              options={selectOptions}
              fullWidth
            />
          </div>
        </Card>

        {/* Cards Section */}
        <Card title="Cards" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="Card with Title">
              <p>This is a basic card with a title.</p>
            </Card>
            <Card title="Card with Title and Subtitle" subtitle="This is a subtitle">
              <p>This card has both a title and subtitle.</p>
            </Card>
            <Card
              title="Card with Footer"
              footer={
                <div className="flex justify-end">
                  <Button size="sm">Action</Button>
                </div>
              }
            >
              <p>This card has a footer with an action button.</p>
            </Card>
            <Card>
              <p>This is a simple card without any header or footer.</p>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ComponentsDemo; 